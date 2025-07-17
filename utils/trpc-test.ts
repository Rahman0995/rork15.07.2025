import { vanillaTrpcClient } from '@/lib/trpc';

export async function testTrpcConnection() {
  try {
    console.log('Testing tRPC connection...');
    
    // Test the hi procedure
    const hiResult = await vanillaTrpcClient.example.hi.query({ name: 'Test' });
    console.log('Hi procedure result:', hiResult);
    
    // Test getting tasks
    const tasksResult = await vanillaTrpcClient.example.getTasks.query();
    console.log('Tasks result:', tasksResult);
    
    // Test getting reports
    const reportsResult = await vanillaTrpcClient.example.getReports.query();
    console.log('Reports result:', reportsResult);
    
    return {
      success: true,
      results: {
        hi: hiResult,
        tasks: tasksResult,
        reports: reportsResult,
      }
    };
  } catch (error) {
    console.error('tRPC connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function testTrpcMutations() {
  try {
    console.log('Testing tRPC mutations...');
    
    // Test creating a task
    const newTask = await vanillaTrpcClient.example.createTask.mutate({
      title: 'Test Task from Vanilla Client',
      description: 'This task was created using the vanilla tRPC client',
      priority: 'low',
      assignedTo: '1',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    });
    console.log('Created task:', newTask);
    
    // Test creating a report
    const newReport = await vanillaTrpcClient.example.createReport.mutate({
      title: 'Test Report from Vanilla Client',
      content: 'This report was created using the vanilla tRPC client',
    });
    console.log('Created report:', newReport);
    
    return {
      success: true,
      results: {
        task: newTask,
        report: newReport,
      }
    };
  } catch (error) {
    console.error('tRPC mutations test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}