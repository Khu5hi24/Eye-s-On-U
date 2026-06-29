'use client';

import React from 'react';
import { FilteredTasksList } from '@/components/FilteredTasksList';

export default function CompletedTasksPage() {
  return <FilteredTasksList category="completed" />;
}
