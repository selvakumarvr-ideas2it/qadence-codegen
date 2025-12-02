import Add from '@/assets/icons/Add.svg?react';
import ApplicationIcon from '@/assets/icons/ApplicationIcon.svg?react';
import BriefcaseIcon from '@/assets/icons/BriefcaseIcon.svg?react';
import CameraIcon from '@/assets/icons/Camera.svg?react';
import DashboardIcon from '@/assets/icons/DashboardIcon.svg?react';
import Exclamation from '@/assets/icons/Exclamation.svg?react';
import LogoutIcon from '@/assets/icons/LogoutIcon.svg?react';
import MenuDotIcon from '@/assets/icons/MenuDotIcon.svg?react';
import RunHistoryIcon from '@/assets/icons/RunHistoryIcon.svg?react';
import UserSettingsIcon from '@/assets/icons/UserSettingsIcon.svg?react';
import { GeneratedScripts } from '@/components/new-test-case/GeneratedScripts';
import { UploadTestCase } from '@/components/new-test-case/UploadTestCase';
import { RecordNewTestCase } from '@/components/record-test-case/RecordNewTestCase';
import { RunNewTest } from '@/components/run-test/RunNewTest';
import { RunStatus } from '@/constants/appConstant';
import { useAppContext } from '@/context/app/AppContext';
import { AppReducerActions } from '@/context/app/AppReducer';
import useGetApplicationSummaryByTenant from '@/hooks/useGetApplicationSummaryByTenant';
import useGetGenerationScript from '@/hooks/useGetGenerationScript';
import { logout } from '@/utils/auth';
import { calculatePercentage, cn } from '@/utils/util';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Modal } from '../modal/modal';
import {
  hideCornerLoader,
  showCornerLoader,
} from '../skeletonLoader/ScriptLoader';

interface INavigationItem {
  id: string;
  label: string;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  path: string;
}

interface IUserProfile {
  name: string;
  organization: string;
  avatar?: string;
}

export function Sidebar() {
  const location = useLocation();
  const { state: appState, dispatch: appDispatch } = useAppContext();
  const { selectedApplication } = appState;
  const menuRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isRunTestPopupOpen, setIsRunTestPopupOpen] = useState<boolean>(false);
  const [isOpenNewRunForm, setIsOpenNewRunForm] = useState<boolean>(false);
  const [isOpenNewTestCaseModal, setIsOpenNewTestCaseModal] =
    useState<boolean>(false);
  const [isOpenRecordNewTestCase, setIsOpenRecordNewTestCase] =
    useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<IUserProfile>();
  const [trackerId, setTrackerId] = useState<string | null>(null);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [showGeneratedScriptsModal, setShowGeneratedScriptsModal] =
    useState(false);

  const roles = JSON.parse(localStorage.getItem('roles') ?? '[]') as string[];
  const isPlatformAdmin = roles.includes('PLATFORM_ADMIN');

  const userName = localStorage.getItem('user') || 'User';
  const organization = localStorage.getItem('organization') || 'organization';

  // Poll the generation script status every 1 minute when trackerId is set
  // This stays active even after modal closes
  const shouldPoll = trackerId !== null && !isGenerationComplete;
  const { data: generationStatus } = useGetGenerationScript(
    trackerId ?? undefined,
    shouldPoll ? 60000 : false
  );

  // Show loader immediately when polling starts
  useEffect(() => {
    if (shouldPoll && !isGenerationComplete) {
      showCornerLoader({
        title: 'Automation script generation',
        progress: calculatePercentage(
          generationStatus?.data?.completedCount || 0,
          generationStatus?.data?.totalCount || 1
        ),
        mainText: 'Generation in Progress',
        subtitle: 'Script generation is underway',
      });
    }
  }, [shouldPoll, isGenerationComplete]);

  // Monitor the generation status and update loader
  useEffect(() => {
    if (generationStatus?.data?.status === RunStatus.COMPLETED) {
      setIsGenerationComplete(true);
      // Update loader to show completion state
      showCornerLoader({
        title: 'Automation script generation',
        progress: calculatePercentage(
          generationStatus?.data?.completedCount || 0,
          generationStatus?.data?.totalCount || 1
        ),
        mainText: 'Completed',
        isCompleted: true,
        onClick: () => {
          setShowGeneratedScriptsModal(true);
          hideCornerLoader();
        },
      });
    } else if (
      generationStatus?.success === true &&
      generationStatus?.data?.status !== RunStatus.COMPLETED &&
      shouldPoll
    ) {
      // Still in progress - update progress
      showCornerLoader({
        title: 'Automation script generation',
        progress: calculatePercentage(
          generationStatus?.data?.completedCount || 0,
          generationStatus?.data?.totalCount || 1
        ),
        mainText: 'Generation in Progress',
        subtitle: 'Script generation is underway',
      });
    }
  }, [generationStatus, shouldPoll]);

  useEffect(() => {
    if (userName) {
      setUserProfile((prev) => ({
        ...prev,
        name: userName,
        organization: isPlatformAdmin ? 'idea2IT' : organization,
      }));
    }
  }, [userName, organization, isPlatformAdmin]);

  const sidebarNavItems: INavigationItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        label: 'Dashboard',
        Icon: DashboardIcon,
        path: '/dashboard',
      },
      {
        id: 'application',
        label: 'Application',
        Icon: ApplicationIcon,
        path: '/applications',
      },
      {
        id: 'run-history',
        label: 'Run History',
        Icon: RunHistoryIcon,
        path: '/run-history',
      },
      {
        id: 'bugs',
        label: 'Bugs',
        Icon: Exclamation,
        path: '/bugs',
      },
      {
        id: 'client-accounts',
        label: 'Client Accounts',
        Icon: BriefcaseIcon,
        path: '/client-accounts',
      },
      {
        id: 'users',
        label: 'Users',
        Icon: UserSettingsIcon,
        path: '/user-account',
      },
      {
        id: 'test-steps-screenshot',
        label: 'Test Steps Screenshot',
        Icon: CameraIcon,
        path: '/test-steps-screenshot',
      },
    ],
    []
  );

  const visibleNavItems = useMemo(() => {
    if (isPlatformAdmin) {
      return sidebarNavItems.filter(
        (item) =>
          item.id !== 'dashboard' &&
          item.id !== 'application' &&
          item.id !== 'run-history' &&
          item.id !== 'bugs' &&
          item.id !== 'test-steps-screenshot'
      );
    }
    return sidebarNavItems.filter(
      (item) => item.id !== 'client-accounts' && item.id !== 'users'
    );
  }, [isPlatformAdmin, sidebarNavItems]);

  const tenantId = localStorage.getItem('tenant_id');

  const { data: applicationsData, isLoading: isApplicationsDataLoading } =
    useGetApplicationSummaryByTenant(tenantId || '', !!tenantId);

  useEffect(() => {
    if (
      !isApplicationsDataLoading &&
      applicationsData?.length &&
      !selectedApplication
    ) {
      appDispatch({
        type: AppReducerActions.SET_SELECTED_APPLICATION,
        payload: {
          label: applicationsData[0]?.name ?? '',
          value: applicationsData[0]?.id ?? '',
        },
      });

      appDispatch({
        type: AppReducerActions.SET_APPLICATION_LIST,
        payload: applicationsData,
      });
    }
  }, [
    isApplicationsDataLoading,
    applicationsData,
    selectedApplication,
    appDispatch,
  ]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleMouseEnter = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsCollapsed(true);
    setIsMenuOpen(false);
    setIsRunTestPopupOpen(false);
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    localStorage.setItem('showLogoutMessage', 'true');
    window.location.href = '/login';
  };

  const renderHeader = () => (
    <div className="flex items-center px-4 py-3 gap-2 justify-center text-xl font-['aeonik-bold'] font-light">
      {isCollapsed ? (
        <div>
          <span className="text-[#c63d3d]">Q</span>a
        </div>
      ) : (
        <div>
          <span className="text-[#c63d3d]">Qa</span>dence
        </div>
      )}
    </div>
  );

  const handleRunTestClick = () => {
    setIsRunTestPopupOpen(true);
  };

  const handleNewTestCaseClick = () => {
    setIsCollapsed(true);
    setIsOpenNewTestCaseModal(true);
    setIsRunTestPopupOpen(false);
  };

  const openRunNewTest = () => {
    setIsCollapsed(true);
    setIsOpenNewRunForm(true);
    setIsRunTestPopupOpen(false);
  };

  const openRecordNewTestCase = () => {
    setIsCollapsed(true);
    setIsOpenRecordNewTestCase(true);
    setIsRunTestPopupOpen(false);
  };

  const renderRunTestPopup = () => {
    return (
      <div>
        <div
          className=" ml-2 mt-1
                 w-[132px] rounded-lg bg-white border border-gray-200 shadow-lg
                 p-2 flex flex-col gap-1"
        >
          <button
            onClick={openRunNewTest}
            className="w-full px-2 py-1 text-left text-sm text-gray-700 font-medium hover:bg-gray-100 rounded-md whitespace-nowrap cursor-pointer"
          >
            New Run
          </button>
          <div className="relative group">
            <button
              className="w-full px-2 py-1 text-left text-sm text-gray-700 font-medium hover:bg-gray-100 rounded-md whitespace-nowrap cursor-pointer"
              aria-haspopup="menu"
              tabIndex={0}
              aria-label="New Test Case Menu"
            >
              New Test Case
            </button>
            <div
              role="menu"
              className="absolute top-0 left-full ml-2 z-50 hidden group-hover:block group-focus-within:block
                         w-[164px] rounded-lg bg-white border border-gray-200 shadow-lg p-2"
            >
              <button
                onClick={handleNewTestCaseClick}
                role="menuitem"
                className="w-full px-2 py-1 text-left text-sm text-gray-700 font-medium hover:bg-gray-100 rounded-md whitespace-nowrap cursor-pointer"
                aria-label="Upload Test Case"
              >
                Upload Test Case
              </button>
              <button
                onClick={openRecordNewTestCase}
                role="menuitem"
                className="w-full px-2 py-1 text-left text-sm text-gray-700 font-medium hover:bg-gray-100 rounded-md whitespace-nowrap cursor-pointer"
                aria-label="Record Testcase"
              >
                Record Test Case
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNavigation = () => (
    <nav className="flex-1 px-2 pb-4 space-y-1">
      {visibleNavItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            className={cn(
              'group flex items-center px-3 py-1.5 lg:px-4 lg:py-2 rounded-md font-medium',
              isCollapsed ? 'justify-center' : 'text-base',
              isActive
                ? 'bg-[#0052CC] text-white'
                : 'text-[#42526E] hover:bg-[#E9F2FF] hover:text-[#0052CC]'
            )}
          >
            <item.Icon
              className={cn(
                'h-5 w-5 min-w-4 min-h-4',
                isActive
                  ? 'brightness-0 invert' // Makes icon white when active
                  : 'group-hover:text-[#0052CC]',
                !isCollapsed && 'mr-3'
              )}
            />
            {!isCollapsed && (
              <span
                className={`text-sm ${isActive ? 'text-white' : 'group-hover:text-[#0052CC]'}`}
              >
                {item.label}
              </span>
            )}
          </NavLink>
        );
      })}
      {!isPlatformAdmin && (
        <div>
          <button
            onClick={handleRunTestClick}
            className="flex w-full items-center gap-1 cursor-pointer px-2  rounded-md text-[#42526E] hover:bg-[#E9F2FF] hover:text-[#0052CC]"
            aria-label="Add New"
          >
            <Add className="h-10 w-10 -ml-0.5" />
            {!isCollapsed && (
              <span className="text-sm  group-hover:text-[#0052CC] font-medium">
                Add New
              </span>
            )}
          </button>
          {!isCollapsed && isRunTestPopupOpen && renderRunTestPopup()}
        </div>
      )}
    </nav>
  );

  const handleClose = () => {
    setIsOpenNewRunForm(false);
    setIsRunTestPopupOpen(false);
    setIsCollapsed(true);
  };

  const handleCloseTestCaseModal = () => {
    setIsOpenNewTestCaseModal(false);
    setIsRunTestPopupOpen(false);
    setIsCollapsed(true);
  };
  const handleCloseRecordNewTestCase = () => {
    setIsOpenRecordNewTestCase(false);
    setIsRunTestPopupOpen(false);
    setIsCollapsed(true);
  };

  // Callback to set trackerId from UploadTestCase
  const handleTrackerIdSet = (id: string) => {
    setTrackerId(id);
    setIsGenerationComplete(false);
  };

  const renderUserProfile = () => {
    return (
      <>
        {!isCollapsed && userProfile && (
          <div
            className={cn('px-6 py-4 flex items-center gap-3 relative')}
            ref={menuRef}
          >
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={`${userProfile.name}'s avatar`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-medium text-xl">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile.name.charAt(0).toUpperCase() +
                  userProfile.name.slice(1)}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile.organization}
              </p>
            </div>
            <button
              className="p-1 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Menu"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <MenuDotIcon className="w-4 h-4 text-gray-600" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-2 bottom-full mb-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                >
                  <LogoutIcon className="w-4 h-4 text-gray-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      {isOpenNewRunForm && selectedApplication ? (
        <div>
          <RunNewTest
            onClose={handleClose}
            selectedApplication={selectedApplication}
            isApplicationsDataLoading={isApplicationsDataLoading}
          />
        </div>
      ) : (
        isOpenNewRunForm && (
          <div>
            <Modal
              isOpen={true}
              onClose={handleClose}
              className="bg-white w-43"
              isCloseButtonEnabled={true}
              children={<p>No Run Found</p>}
            />
          </div>
        )
      )}

      {isOpenNewTestCaseModal && (
        <div>
          <Modal
            isOpen={true}
            onClose={handleCloseTestCaseModal}
            className="bg-white w-full max-w-lg mx-4"
            isCloseButtonEnabled={true}
          >
            <UploadTestCase
              onBack={handleCloseTestCaseModal}
              onTrackerIdSet={handleTrackerIdSet}
            />
          </Modal>
        </div>
      )}
      {isOpenRecordNewTestCase && selectedApplication ? (
        <div>
          <RecordNewTestCase
            onClose={handleCloseRecordNewTestCase}
            selectedApplication={selectedApplication}
            isApplicationsDataLoading={isApplicationsDataLoading}
          />
        </div>
      ) : (
        isOpenRecordNewTestCase && (
          <div>
            <Modal
              isOpen={true}
              onClose={handleCloseRecordNewTestCase}
              className="bg-white w-43"
              isCloseButtonEnabled={true}
              children={<p>No Run Found</p>}
            />
          </div>
        )
      )}
      {/* GeneratedScripts Modal - moved here so it persists */}
      {showGeneratedScriptsModal && (
        <GeneratedScripts
          onBack={() => {
            setShowGeneratedScriptsModal(false);
            setTrackerId(null);
            setIsGenerationComplete(false);
          }}
          trackerId={trackerId ?? ''}
        />
      )}

      <div
        className={`sidebar bg-white border-r border-gray-300 h-screen flex flex-col justify-between ${isCollapsed ? 'collapsed-sidebar' : 'expanded-sidebar'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {renderHeader()}
        {renderNavigation()}
        {renderUserProfile()}
      </div>
    </div>
  );
}
