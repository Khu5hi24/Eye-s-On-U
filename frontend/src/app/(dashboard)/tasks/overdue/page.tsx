'use client';

import React from 'react';
import { FilteredTasksList } from '@/components/FilteredTasksList';

export default function OverdueTasksPage() {
  return <FilteredTasksList category="overdue" />;
}
