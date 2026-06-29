'use client';

import React from 'react';
import { FilteredTasksList } from '@/components/FilteredTasksList';

export default function TotalTasksPage() {
  return <FilteredTasksList category="total" />;
}
