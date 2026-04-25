import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getFinanceRecords } from '@/api/checkin-finance';
import { getExerciseRecords } from '@/api/checkin-exercise';
import { getStudyRecords } from '@/api/checkin-study';

export const useCheckinStore = defineStore('checkin', () => {
  const todayFinanceCount = ref(0);
  const todayExerciseCount = ref(0);
  const todayStudyCount = ref(0);
  const loading = ref(false);

  const hasTodayFinance = computed(() => todayFinanceCount.value > 0);
  const hasTodayExercise = computed(() => todayExerciseCount.value > 0);
  const hasTodayStudy = computed(() => todayStudyCount.value > 0);

  const todayCompletedModules = computed(() => {
    const modules: string[] = [];
    if (hasTodayFinance.value) modules.push('财务');
    if (hasTodayExercise.value) modules.push('运动');
    if (hasTodayStudy.value) modules.push('学习');
    return modules;
  });

  const todayIncompleteModules = computed(() => {
    const modules: string[] = [];
    if (!hasTodayFinance.value) modules.push('财务');
    if (!hasTodayExercise.value) modules.push('运动');
    if (!hasTodayStudy.value) modules.push('学习');
    return modules;
  });

  const isTodayFullyCheckedIn = computed(() => {
    return hasTodayFinance.value && hasTodayExercise.value && hasTodayStudy.value;
  });

  async function fetchTodayStatus() {
    loading.value = true;
    try {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const [financeRecords, exerciseRecords, studyRecords] = await Promise.all([
        getFinanceRecords({
          startDate: todayStart.toISOString(),
          endDate: todayEnd.toISOString(),
        }),
        getExerciseRecords({
          startDate: todayStart.toISOString(),
          endDate: todayEnd.toISOString(),
        }),
        getStudyRecords({
          startDate: todayStart.toISOString(),
          endDate: todayEnd.toISOString(),
        }),
      ]);

      todayFinanceCount.value = financeRecords.length;
      todayExerciseCount.value = exerciseRecords.length;
      todayStudyCount.value = studyRecords.length;
    } catch (error) {
      console.error('获取今日打卡状态失败:', error);
      // 出错时重置为0，不影响UI
      todayFinanceCount.value = 0;
      todayExerciseCount.value = 0;
      todayStudyCount.value = 0;
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    todayFinanceCount.value = 0;
    todayExerciseCount.value = 0;
    todayStudyCount.value = 0;
    loading.value = false;
  }

  return {
    todayFinanceCount,
    todayExerciseCount,
    todayStudyCount,
    loading,
    hasTodayFinance,
    hasTodayExercise,
    hasTodayStudy,
    todayCompletedModules,
    todayIncompleteModules,
    isTodayFullyCheckedIn,
    fetchTodayStatus,
    reset,
  };
});