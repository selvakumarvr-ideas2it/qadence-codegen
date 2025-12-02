interface ITestCase {
  id: string;
  name: string;
}

interface ITestSuite {
  id: string;
  name: string;
  testcases: ITestCase[];
}

interface IRequestJsonPayload {
  testsuites: ITestSuite[];
  environments: (string | number)[];
  browsers: (string | number)[];
}

interface INewRunFormRequest {
  applicationId: string | number | null;
  triggerReason: string;
  testRequestPayload: IRequestJsonPayload;
}

interface INewRunFormResponse {
  success: boolean;
  message: string;
}

export type { INewRunFormRequest, INewRunFormResponse };
