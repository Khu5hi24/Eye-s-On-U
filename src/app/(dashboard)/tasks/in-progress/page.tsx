'use client';

import React from 'react';
import { FilteredTasksList } from '@/components/FilteredTasksList';

export default function InProgressTasksPage() {
  return <FilteredTasksList category="in-progress" />;
}
