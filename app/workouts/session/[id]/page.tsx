"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  useWorkoutPlan,
  useWorkoutSession,
  useStartWorkoutSession,
  useAddWorkoutSet,
  useFinishWorkoutSession,
  useDeleteWorkoutSession,
} from "@/features/workouts/hooks";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

type SetState = {
  reps: number;
  weight: number;
  logged: boolean;
  loading: boolean;
};

export default function WorkoutSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Active workout states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [notes, setNotes] = useState("");
  const [restTimeRemaining, setRestTimeRemaining] = useState<number | null>(null);
  const [restTotalTime, setRestTotalTime] = useState<number>(0);

  // Map: exerciseId -> setNumber (1-indexed) -> SetState
  const [setStates, setSetStates] = useState<Record<string, Record<number, SetState>>>({});

  // Queries & Mutations
  const { data: plan, isLoading: isPlanLoading, isError: isPlanError } = useWorkoutPlan(id);
  const { data: sessionData } = useWorkoutSession(sessionId ?? "");

  const startSessionMutation = useStartWorkoutSession();
  const addWorkoutSetMutation = useAddWorkoutSet(sessionId ?? "");
  const finishSessionMutation = useFinishWorkoutSession(sessionId ?? "");
  const deleteSessionMutation = useDeleteWorkoutSession();

  // Local storage restore on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem(`active_session_id_${id}`);
    const storedStartTime = localStorage.getItem(`active_session_start_time_${id}`);
    
    if (storedSessionId && storedStartTime) {
      setSessionId(storedSessionId);
      setIsTimerRunning(true);
      
      const elapsed = Math.max(0, Math.floor((Date.now() - Number(storedStartTime)) / 1000));
      setTime(elapsed);
      toast.info("Resumed active workout session!");
    }
  }, [id]);

  // Sync sessionData with local state (logged sets)
  useEffect(() => {
    if (!plan?.exercises) return;

    setSetStates((prev) => {
      const updated = { ...prev };
      
      plan.exercises!.forEach((ex) => {
        if (!updated[ex.id]) {
          updated[ex.id] = {};
        }
        
        const targetSets = ex.target_sets ?? 3;
        const loggedSetsForEx = sessionData?.sets?.filter(
          (s: any) => s.exercise_id === ex.id
        ) ?? [];

        const maxSetNumber = Math.max(
          targetSets,
          ...loggedSetsForEx.map((s: any) => s.set_number),
          0
        );

        for (let s = 1; s <= maxSetNumber; s++) {
          const loggedSet = loggedSetsForEx.find((ls: any) => ls.set_number === s);
          
          if (loggedSet) {
            updated[ex.id][s] = {
              reps: loggedSet.reps,
              weight: loggedSet.weight_kg ?? 0,
              logged: true,
              loading: false,
            };
          } else if (!updated[ex.id][s]) {
            updated[ex.id][s] = {
              reps: ex.target_reps ?? 10,
              weight: ex.target_weight_kg ?? 0,
              logged: false,
              loading: false,
            };
          }
        }
      });

      return updated;
    });
  }, [plan, sessionData]);

  // Self-heal localstorage if session is already finished on backend
  useEffect(() => {
    if (sessionData && sessionData.status !== "in_progress") {
      localStorage.removeItem(`active_session_id_${id}`);
      localStorage.removeItem(`active_session_start_time_${id}`);
      setSessionId(null);
      setIsTimerRunning(false);
      setTime(0);
    }
  }, [sessionData, id]);

  // Stopwatch timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Play Beep when rest is finished
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error("Failed to play audio notification", e);
    }
  };

  // Rest Timer ticking
  useEffect(() => {
    if (restTimeRemaining === null) return;
    if (restTimeRemaining <= 0) {
      setRestTimeRemaining(null);
      playBeep();
      toast.info("Rest finished! Time for the next set.");
      return;
    }
    
    const timer = setTimeout(() => {
      setRestTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [restTimeRemaining]);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    const hStr = h > 0 ? `${h.toString().padStart(2, "0")}:` : "";
    const mStr = m.toString().padStart(2, "0");
    const sStr = s.toString().padStart(2, "0");
    
    return `${hStr}${mStr}:${sStr}`;
  };

  // Handlers
  const handleStartWorkout = () => {
    startSessionMutation.mutate(id, {
      onSuccess: (data) => {
        setSessionId(data.id);
        setIsTimerRunning(true);
        setTime(0);
        localStorage.setItem(`active_session_id_${id}`, data.id);
        localStorage.setItem(`active_session_start_time_${id}`, Date.now().toString());
        toast.success("Workout session started! Let's crush it!");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to start workout session.");
      }
    });
  };

  const handleLogSet = (exerciseId: string, setNumber: number) => {
    const exercise = plan?.exercises?.find((ex) => ex.id === exerciseId);
    const currentState = setStates[exerciseId]?.[setNumber];
    if (!currentState) return;

    setSetStates(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [setNumber]: {
          ...prev[exerciseId][setNumber],
          loading: true
        }
      }
    }));

    addWorkoutSetMutation.mutate(
      {
        exercise_id: exerciseId,
        set_number: setNumber,
        reps: currentState.reps,
        weight_kg: currentState.weight,
        completed: true,
      },
      {
        onSuccess: () => {
          toast.success(`Set ${setNumber} logged!`);
          
          if (exercise && exercise.rest_seconds && exercise.rest_seconds > 0) {
            setRestTimeRemaining(exercise.rest_seconds);
            setRestTotalTime(exercise.rest_seconds);
          }
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to log set. Please try again.");
          setSetStates(prev => ({
            ...prev,
            [exerciseId]: {
              ...prev[exerciseId],
              [setNumber]: {
                ...prev[exerciseId][setNumber],
                loading: false
              }
            }
          }));
        }
      }
    );
  };

  const handleAddSet = (exerciseId: string) => {
    const exercise = plan?.exercises?.find((ex) => ex.id === exerciseId);
    const exerciseSets = setStates[exerciseId] || {};
    const currentSetNumbers = Object.keys(exerciseSets).map(Number);
    const nextSetNumber = currentSetNumbers.length > 0 ? Math.max(...currentSetNumbers) + 1 : 1;
    
    const lastSet = exerciseSets[nextSetNumber - 1];
    const reps = lastSet ? lastSet.reps : (exercise?.target_reps ?? 10);
    const weight = lastSet ? lastSet.weight : (exercise?.target_weight_kg ?? 0);
    
    setSetStates(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [nextSetNumber]: {
          reps,
          weight,
          logged: false,
          loading: false
        }
      }
    }));
    
    toast.success(`Set ${nextSetNumber} added!`);
  };

  const updateSetState = (exerciseId: string, setNumber: number, field: 'reps' | 'weight', value: number) => {
    setSetStates(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [setNumber]: {
          ...prev[exerciseId][setNumber],
          [field]: value
        }
      }
    }));
  };

  const handleRepsChange = (exerciseId: string, setNumber: number, delta: number) => {
    const currentVal = setStates[exerciseId]?.[setNumber]?.reps ?? 10;
    updateSetState(exerciseId, setNumber, 'reps', Math.max(0, currentVal + delta));
  };

  const handleRepsInput = (exerciseId: string, setNumber: number, valueStr: string) => {
    const val = parseInt(valueStr, 10);
    updateSetState(exerciseId, setNumber, 'reps', isNaN(val) ? 0 : val);
  };

  const handleWeightChange = (exerciseId: string, setNumber: number, delta: number) => {
    const currentVal = setStates[exerciseId]?.[setNumber]?.weight ?? 0;
    const newVal = Math.max(0, currentVal + delta);
    updateSetState(exerciseId, setNumber, 'weight', Math.round(newVal * 100) / 100);
  };

  const handleWeightInput = (exerciseId: string, setNumber: number, valueStr: string) => {
    const val = parseFloat(valueStr);
    updateSetState(exerciseId, setNumber, 'weight', isNaN(val) ? 0 : val);
  };

  const handleFinishWorkout = () => {
    finishSessionMutation.mutate(
      { notes },
      {
        onSuccess: () => {
          localStorage.removeItem(`active_session_id_${id}`);
          localStorage.removeItem(`active_session_start_time_${id}`);
          toast.success("Workout session finished! Excellent job!");
          router.push("/dashboard");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to finish workout session.");
        }
      }
    );
  };

  const handleDiscardSession = () => {
    if (!sessionId) return;
    if (confirm("Are you sure you want to discard this workout? This will permanently delete this session and all its logged sets.")) {
      deleteSessionMutation.mutate(sessionId, {
        onSuccess: () => {
          localStorage.removeItem(`active_session_id_${id}`);
          localStorage.removeItem(`active_session_start_time_${id}`);
          toast.info("Workout session discarded.");
          router.push("/workouts");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to discard session.");
        }
      });
    }
  };

  if (isPlanLoading) {
    return (
      <AppShell title="Workout Session" eyebrow="Loading plan details...">
        <div className="flex h-64 flex-col items-center justify-center space-y-4">
          <div className="size-8 animate-spin rounded-full border-4 border-lime-300 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-400">Loading exercise details...</p>
        </div>
      </AppShell>
    );
  }

  if (isPlanError || !plan) {
    return (
      <AppShell title="Error" eyebrow="Workout Session">
        <div className="rounded-3xl border border-red-950 bg-red-950/20 p-8 text-center">
          <p className="text-base font-bold text-red-400">Workout plan not found</p>
          <p className="mt-2 text-xs text-slate-500">The plan may have been deleted or the API is offline.</p>
          <Link href="/workouts" className="mt-6 inline-flex rounded-xl bg-lime-300 px-5 py-2.5 text-xs font-black text-slate-950">
            Back to plans
          </Link>
        </div>
      </AppShell>
    );
  }

  const sortedExercises = plan.exercises ? [...plan.exercises].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)) : [];

  return (
    <AppShell title={plan.name} eyebrow="Workout Session">
      {!sessionId ? (
        // Start Screen (Preview & Call to Action)
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-3xl border border-lime-200/10 bg-[#0a1710]/95 p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="rounded-full bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-lime-200 border border-lime-300/20">
                  Scheduled: {plan.scheduled_day || "Unscheduled"}
                </span>
                <h2 className="mt-3 text-2xl font-black text-white">{plan.name}</h2>
                {plan.description && (
                  <p className="mt-2 text-sm text-slate-400 italic">{plan.description}</p>
                )}
              </div>
              <div>
                <button
                  onClick={handleStartWorkout}
                  disabled={startSessionMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-lime-300 px-6 py-4 text-sm font-black text-slate-950 shadow-[0_4px_20px_rgba(190,242,100,0.3)] transition hover:bg-lime-400 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {startSessionMutation.isPending ? (
                    <div className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    <>
                      <svg className="size-4 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>Start Workout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
              Planned Exercises ({sortedExercises.length})
            </h3>
            
            <div className="grid gap-3">
              {sortedExercises.length > 0 ? (
                sortedExercises.map((exercise) => (
                  <div key={exercise.id} className="rounded-2xl border border-white/5 bg-[#101b15]/65 p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{exercise.name}</h4>
                      <p className="mt-1 text-xs text-slate-400">
                        {exercise.muscle_group && `${exercise.muscle_group} · `}
                        {exercise.target_sets} sets x {exercise.target_reps} reps
                        {exercise.target_weight_kg ? ` @ ${exercise.target_weight_kg}kg` : ""}
                      </p>
                    </div>
                    {exercise.rest_seconds && (
                      <span className="text-xs text-slate-500 font-semibold">
                        Rest: {exercise.rest_seconds}s
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">
                  <p className="text-xs font-bold">No exercises planned.</p>
                  <p className="mt-1 text-[10px]">Add exercises to this routine in the plan details screen.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Active Session Screen
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Sticky Timer and Status Bar */}
          <div className="sticky top-19 z-10 rounded-2xl border border-lime-500/10 bg-[#07110d]/90 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center size-8 rounded-full bg-lime-500/10 border border-lime-400/20">
                  <span className={`size-3 rounded-full ${isTimerRunning ? "bg-lime-400 animate-pulse" : "bg-amber-400"} transition-colors duration-300`} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">{plan.name}</h2>
                  <p className="text-[9px] font-black text-lime-400/80 uppercase tracking-widest">
                    Active Session
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black font-mono tracking-tight text-lime-300 drop-shadow-[0_0_8px_rgba(163,230,53,0.25)]">
                    {formatTime(time)}
                  </span>
                  
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
                    title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
                  >
                    {isTimerRunning ? (
                      <svg className="size-4 fill-current" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="size-4 fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Reset the stopwatch timer?")) {
                        setTime(0);
                      }
                    }}
                    className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
                    title="Reset Timer"
                  >
                    <svg className="size-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H16" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={() => {
                    const finishSection = document.getElementById("finish-workout-section");
                    if (finishSection) {
                      finishSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="rounded-xl bg-lime-300 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-lime-400 transition cursor-pointer"
                >
                  Finish
                </button>
              </div>
            </div>

            {/* Rest Timer Widget */}
            <AnimatePresence>
              {restTimeRemaining !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden rounded-xl border border-teal-500/20 bg-teal-950/20 p-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <svg className="size-4 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs font-bold text-teal-300">
                        Resting: <span className="font-mono">{restTimeRemaining}s</span> / {restTotalTime}s
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRestTimeRemaining((prev) => (prev !== null ? prev + 15 : 15))}
                        className="rounded-lg bg-teal-400/10 px-2.5 py-1 text-[10px] font-bold text-teal-300 hover:bg-teal-400/20 transition active:scale-95 cursor-pointer"
                      >
                        +15s
                      </button>
                      <button
                        onClick={() => setRestTimeRemaining(null)}
                        className="rounded-lg bg-teal-400/20 px-2.5 py-1 text-[10px] font-black text-teal-200 hover:bg-teal-400/30 transition active:scale-95 cursor-pointer"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1 w-full rounded-full bg-teal-950/80 overflow-hidden">
                    <div
                      className="h-full bg-teal-400 transition-all duration-1000 ease-linear"
                      style={{ width: `${(restTimeRemaining / restTotalTime) * 100}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Exercises list */}
          <div className="space-y-4">
            {sortedExercises.map((exercise) => {
              const exerciseSets = setStates[exercise.id] || {};
              const setNumbers = Object.keys(exerciseSets).map(Number).sort((a, b) => a - b);

              return (
                <div key={exercise.id} className="rounded-3xl border border-white/10 bg-white/4 p-5 shadow-lg space-y-4 backdrop-blur-sm">
                  {/* Exercise header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <h3 className="text-base font-black text-white">{exercise.name}</h3>
                      {exercise.muscle_group && (
                        <span className="mt-1.5 inline-block rounded-full bg-slate-800 px-2.5 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          {exercise.muscle_group}
                        </span>
                      )}
                    </div>
                    {exercise.rest_seconds ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Rest: {exercise.rest_seconds}s</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Sets table/grid */}
                  <div className="space-y-3">
                    {setNumbers.map((s) => {
                      const setInfo = exerciseSets[s] || { reps: 10, weight: 0, logged: false, loading: false };
                      return (
                        <div key={s} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-950/40 p-3 border border-white/2">
                          {/* Left: Set number & target info */}
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center justify-center size-8 rounded-xl text-xs font-black ${
                              setInfo.logged ? "bg-lime-500/20 text-lime-300 border border-lime-500/30" : "bg-slate-900 text-slate-400 border border-white/5"
                            }`}>
                              {s}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                              Target: {exercise.target_reps} &times; {exercise.target_weight_kg}kg
                            </span>
                          </div>

                          {/* Middle: Steppers */}
                          <div className="flex items-center gap-3">
                            {/* Weight Stepper */}
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider mb-1">Weight (kg)</span>
                              <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/60 p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleWeightChange(exercise.id, s, -2.5)}
                                  disabled={setInfo.logged}
                                  className="flex size-11 items-center justify-center rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer"
                                >
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                  </svg>
                                </button>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={setInfo.weight}
                                  onChange={(e) => handleWeightInput(exercise.id, s, e.target.value)}
                                  disabled={setInfo.logged}
                                  className="w-12 bg-transparent text-center font-mono text-xs font-bold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleWeightChange(exercise.id, s, 2.5)}
                                  disabled={setInfo.logged}
                                  className="flex size-11 items-center justify-center rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer"
                                >
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Reps Stepper */}
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider mb-1">Reps</span>
                              <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/60 p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleRepsChange(exercise.id, s, -1)}
                                  disabled={setInfo.logged}
                                  className="flex size-11 items-center justify-center rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer"
                                >
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                  </svg>
                                </button>
                                <input
                                  type="number"
                                  value={setInfo.reps}
                                  onChange={(e) => handleRepsInput(exercise.id, s, e.target.value)}
                                  disabled={setInfo.logged}
                                  className="w-10 bg-transparent text-center font-mono text-xs font-bold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRepsChange(exercise.id, s, 1)}
                                  disabled={setInfo.logged}
                                  className="flex size-11 items-center justify-center rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer"
                                >
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center justify-end min-w-23.75">
                            {setInfo.logged ? (
                              <div className="flex items-center gap-1.5 rounded-xl bg-lime-500/10 border border-lime-500/20 px-3.5 py-2 text-xs font-black text-lime-300">
                                <svg className="size-3.5 stroke-current" strokeWidth="3" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Logged</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleLogSet(exercise.id, s)}
                                disabled={setInfo.loading || addWorkoutSetMutation.isPending}
                                className="flex h-11 items-center justify-center rounded-xl bg-lime-300 px-4.5 text-xs font-black text-slate-950 shadow-sm transition hover:bg-lime-400 active:scale-95 disabled:opacity-50 cursor-pointer"
                              >
                                {setInfo.loading ? (
                                  <div className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                                ) : (
                                  "Log Set"
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Extra Set */}
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddSet(exercise.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-lime-200/70 hover:text-lime-300 transition cursor-pointer"
                    >
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Extra Set</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Finish Screen Section */}
          <div id="finish-workout-section" className="rounded-3xl border border-white/10 bg-white/4 p-5 space-y-4 backdrop-blur-sm">
            <h3 className="text-base font-black text-white">Wrap Up Session</h3>
          

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleFinishWorkout}
                disabled={finishSessionMutation.isPending}
                className="flex-1 flex h-12 items-center justify-center rounded-xl bg-lime-300 text-xs font-black text-slate-950 hover:bg-lime-400 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {finishSessionMutation.isPending ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                ) : (
                  "Finish Workout Session"
                )}
              </button>
              
              <button
                type="button"
                onClick={handleDiscardSession}
                disabled={deleteSessionMutation.isPending}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 h-12 text-xs font-black text-red-300 hover:bg-red-500/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Discard Session
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
