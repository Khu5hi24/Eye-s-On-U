'use client';

import React from 'react';
import { FilteredTasksList } from '@/components/FilteredTasksList';

export default function PendingTasksPage() {
  return <FilteredTasksList category="pending" />;
}
