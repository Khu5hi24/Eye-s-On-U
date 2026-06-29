import { useTaskStore } from './taskStore';

// Delegate directly to the unified store to maintain shared reactive state
export const useTeamStore = useTaskStore;
export type { UnifiedState as TeamState } from './taskStore';