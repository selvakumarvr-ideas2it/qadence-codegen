import type { IApplicationSummaryByTenant } from '@/interfaces/Dashboard';

export const AppReducerActions = {
  SET_SELECTED_APPLICATION: 'SET_SELECTED_APPLICATION',
  SET_APPLICATION_LIST: 'SET_APPLICATION_LIST',
} as const;

export type AppReducerActionType =
  (typeof AppReducerActions)[keyof typeof AppReducerActions];

export interface IAppInitialState {
  selectedApplication: {
    label: string;
    value: string | number;
  } | null;
  applicationList: IApplicationSummaryByTenant[] | null;
}

type SelectedApplicationPayload = IAppInitialState['selectedApplication'];
type ApplicationListPayload = IAppInitialState['applicationList'];

export type IAppReducerAction =
  | {
      type: typeof AppReducerActions.SET_SELECTED_APPLICATION;
      payload: SelectedApplicationPayload;
    }
  | {
      type: typeof AppReducerActions.SET_APPLICATION_LIST;
      payload: ApplicationListPayload;
    };

export const appInitialStateValues: IAppInitialState = {
  selectedApplication: null,
  applicationList: null,
};

export const appReducer = (
  state: IAppInitialState,
  action: IAppReducerAction
) => {
  switch (action.type) {
    case AppReducerActions.SET_SELECTED_APPLICATION:
      return { ...state, selectedApplication: action.payload };
    case AppReducerActions.SET_APPLICATION_LIST:
      return { ...state, applicationList: action.payload };
    default:
      return state;
  }
};
