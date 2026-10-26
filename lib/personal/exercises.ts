/** Shared display catalogue. Targets are owned by the server, never request input. */
export const exercises = [
 {id:'lantern-arms',name:'Lantern arms',target:4},
 {id:'lantern-route',name:'Lantern route',target:8},
 {id:'neck-reset',name:'Neck reset',target:4},
 {id:'shoulder-rolls',name:'Shoulder lifts',target:6},
] as const;
export type ExerciseId = typeof exercises[number]['id'];
export function getExercise(id:unknown){return exercises.find(exercise=>exercise.id===id);}
