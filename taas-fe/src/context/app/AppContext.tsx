import { createContext, useContext, useReducer } from 'react';
import {
  appInitialStateValues,
  appReducer,
  type IAppInitialState,
  type IAppReducerAction,
} from './AppReducer';

interface IProviderProps {
  children: React.ReactNode;
}

export interface IAppContextType {
  state: IAppInitialState;
  dispatch: React.Dispatch<IAppReducerAction>;
}

export const AppContext = createContext<IAppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: IProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, appInitialStateValues);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
