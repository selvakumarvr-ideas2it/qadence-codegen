export const QUERY_KEYS = {
  // Dashboard Query Keys
  getLastRunAndRegression: (applicationId: string | number | 'none') => [
    'last-run-and-regression',
    applicationId,
  ],
  getApplicationSummaryByTenant: (tenantId: string) => [
    'applicationSummaryByTenant',
    tenantId,
  ],
  getAllTestRuns: (applicationId: string | number | 'none') => [
    'all-test-runs',
    applicationId,
  ],
  getRunHistoryTestCaseByTestSuite: (testSuiteId: string) => [
    'runHistoryTestCaseByTestSuite',
    testSuiteId,
  ],
  getRunHistoryTestSuiteByTestRun: (
    testRunId: string,
    applicationId: string
  ) => ['test-suites', testRunId, applicationId],
  getRunHistoryTestArtifactByTestCase: (
    applicationId: string,
    testRunId: string,
    testSuiteId: string,
    testCaseId: string
  ) => [
    'runHistoryTestArtifactByTestCase',
    applicationId,
    testRunId,
    testSuiteId,
    testCaseId,
  ],
  getApplicationListByTenant: (tenantId: string) => [
    'applicationListByTenant',
    tenantId,
  ],
  getSuiteByApplicationId: (applicationId: string) => [
    'suiteByApplicationId',
    applicationId,
  ],
  getFailureByApplicationId: (applicationId: string) => [
    'failureByApplicationId',
    applicationId,
  ],
  getConfirmedBug: ['confirmedBug'],
  getGenerationScript: (testCaseTrackerId: string | number | 'none') => [
    'generation-status',
    testCaseTrackerId,
  ],
  getScriptFile: (testCaseTrackerId: string | number | 'none') => [
    'script-files',
    testCaseTrackerId,
  ],
  downloadScriptFile: (scriptUrl: string | number | 'none') => [
    'download-script-file',
    scriptUrl,
  ],

  // Admin Portal Query Keys
  getApplicationsByTenant: (tenantId: string) => [
    'clientDetailByTenant',
    tenantId,
  ],
  getAllTenants: ['allTenants'],

  getAllUsersList: (page: number) => ['users', { page }],
  createUser: ['createUser'],
  updateUser: (userId: string) => ['updateUser', userId],
  getRolesByTenant: (tenantId: string) => ['rolesByTenant', tenantId],
};
