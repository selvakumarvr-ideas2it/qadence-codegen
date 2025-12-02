import ChevronWhite from '@/assets/icons/ChevronWhite.svg?react';
import DownChevronGray from '@/assets/icons/DownChevronGray.svg?react';
import { SCOPE, SCRIPT_STATUS } from '@/constants/appConstant';
import { useAssociateTestCasesWithSuiteMutation } from '@/hooks/mutation/useAssociateTestCasesWithSuiteMutation';
import { useCreateTestSuiteMutation } from '@/hooks/mutation/useCreateTestSuiteMutation';
import useDownloadScriptFileMutation from '@/hooks/mutation/useDownloadScriptFileMutation';
import useGetScriptFile from '@/hooks/useGetScriptFile';
import useGetSuiteByApplicationId from '@/hooks/useGetSuiteByApplicationId';
import { useToast } from '@/hooks/useToast';
import type { IApplicationTestCase } from '@/interfaces/Application';
import type { IScriptFile } from '@/interfaces/UploadTestCase';
import { downloadBlob, generateScriptFilename } from '@/utils/downloadUtil';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { SearchDropdown } from '../application/SearchDropdown';
import { SearchInput } from '../application/SearchInput';
import DownloadButton from '../shared/buttons/DownloadButton';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import { Card } from '../shared/card/Card';
import { Modal } from '../shared/modal/modal';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import type { ISelectOption } from '../shared/select/Select';
import { SuiteSearchDropdown } from '../shared/select/SuiteSearchDropdown';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';

interface IGeneratedScriptsProps {
  onBack: () => void;
  trackerId?: string | number;
}

interface ScriptWithSelection extends IScriptFile {
  selectionKey: string;
  selected: boolean;
  selectedSuiteId?: string;
  selectedSuiteName?: string;
}

export function GeneratedScripts({
  onBack,
  trackerId,
}: IGeneratedScriptsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openMoveAllDropdown, setOpenMoveAllDropdown] = useState(false);
  const [activeApplicationId, setActiveApplicationId] = useState('');
  const [scriptSelections, setScriptSelections] = useState<
    Record<
      string,
      {
        selected: boolean;
        selectedSuiteId?: string;
        selectedSuiteName?: string;
      }
    >
  >({});
  const [moveAllSuiteName, setMoveAllSuiteName] = useState('');
  const moveAllDropdownRef = useRef<HTMLDivElement>(null);
  const suiteDropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const pendingSelectionRef = useRef<{
    scope: (typeof SCOPE)[keyof typeof SCOPE];
    index?: number;
    name: string;
  } | null>(null);
  const [showSuiteDropdown, setShowSuiteDropdown] = useState<number | null>(
    null
  );
  const [suites, setSuites] = useState<{ id: string; name: string }[]>([]);
  const [submissionError, setSubmissionError] = useState('');
  const toast = useToast();
  const [downloadingById, setDownloadingById] = useState<
    Record<string, boolean>
  >({});
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Define these inside your component, above the hook call
  const handleAssociateSuccess = useCallback(() => {
    setSubmissionError('');
    toast.success('Test cases associated successfully');
    onBack();
  }, [onBack, toast]);

  const handleAssociateError = useCallback(
    (err: unknown) => {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Failed to associate test cases.';
      setSubmissionError(message);
      toast.error('Failed to associate test cases.');
    },
    [toast]
  );

  const { associateMutation, onAssociateTestCases } =
    useAssociateTestCasesWithSuiteMutation({
      onSuccess: handleAssociateSuccess,
      onError: handleAssociateError,
    });

  // handle submit
  const handleSubmitAssociations = () => {
    setSubmissionError('');

    if (!tenantId || !trackerId) {
      setSubmissionError('Missing tenant or tracker information.');
      return;
    }

    // Keys that are explicitly selected via checkbox
    const selectedKeys = Object.entries(scriptSelections)
      .filter(([, v]) => v.selected)
      .map(([k]) => k);

    const selectedScripts = scripts.filter((s) =>
      selectedKeys.includes(s.selectionKey)
    );

    // If there are explicit selections, we operate ONLY on them.
    // Otherwise, we fall back to all suite-mapped test cases.
    const usingExplicitSelection = selectedScripts.length > 0;
    const targetScripts = usingExplicitSelection
      ? selectedScripts
      : scriptsWithSuites;

    // Validate: if using explicit selection, all selected must have a suite
    if (usingExplicitSelection) {
      const incomplete = selectedScripts.filter((s) => !s.selectedSuiteId);
      if (incomplete.length > 0) {
        setSubmissionError('Please assign a suite to every selected script.');
        return;
      }
    } else {
      // No explicit selection: if nothing is suite-mapped, just exit (current behavior)
      if (targetScripts.length === 0) {
        onBack();
        return;
      }
    }

    const mapping = targetScripts
      .filter((s) => s.selectedSuiteId && s.testCaseId)
      .map((s) => ({
        testSuiteId: s.selectedSuiteId as string,
        testCaseId: s.testCaseId as string,
      }));

    onAssociateTestCases({
      applicationId: activeApplicationId || (scripts[0]?.applicationId ?? ''),
      payload: {
        trackerId: String(trackerId),
        mapping,
      },
    });
  };

  const tenantId = localStorage.getItem('tenant_id') || '';
  const { mutateAsync: downloadScriptFile } = useDownloadScriptFileMutation();

  const { data: suiteDetails, refetch: refetchSuites } =
    useGetSuiteByApplicationId(activeApplicationId);

  // Fetch script files using the API
  const {
    data: scriptFilesData,
    isLoading,
    error,
  } = useGetScriptFile(trackerId);

  const MAX_SUITE_NAME_CHARS = 10;
  const truncateText = (text: string, max: number = MAX_SUITE_NAME_CHARS) => {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '...' : text;
  };

  const isValidSuiteName = (name: string): boolean => {
    if (!name) return false;
    // Must start with an uppercase letter, followed by only letters or digits. No spaces.
    return /^[A-Z][a-zA-Z0-9]*$/.test(name.trim());
  };

  // Transform API data to include selection state
  const scripts: ScriptWithSelection[] = useMemo(
    () =>
      scriptFilesData?.data?.map((script, index) => {
        const key = script.id || script.testCaseId || `index-${index}`;
        return {
          ...script,
          selectionKey: key,
          selected: scriptSelections[key]?.selected ?? false,
          selectedSuiteId: scriptSelections[key]?.selectedSuiteId,
          selectedSuiteName: scriptSelections[key]?.selectedSuiteName,
        };
      }) || [],
    [scriptFilesData?.data, scriptSelections]
  );

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const matchesSearch = (script: ScriptWithSelection) => {
    if (!normalizedSearch) return true;
    const name = script.testCaseName?.toLowerCase() ?? '';
    const desc = script.testCaseDescription?.toLowerCase() ?? '';
    return name.includes(normalizedSearch) || desc.includes(normalizedSearch);
  };

  // Filter scripts by search term and create dropdown options
  const filteredScriptOptions: ISelectOption[] = scripts
    .filter(matchesSearch)
    .map((script) => {
      const name = script.testCaseName ?? '';
      const desc = script.testCaseDescription ?? '';
      const label = desc ? `${name} — ${desc}` : name; // shows description in dropdown
      return {
        label,
        value: script.id || '',
      };
    });

  // Filter scripts to display based on search term
  const filteredScripts = searchTerm.trim()
    ? scripts.filter((script) =>
        script.testCaseName
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim())
      )
    : scripts;

  const scriptsWithSuites = useMemo(
    () =>
      scripts.filter((script) => script.selectedSuiteId && script.testCaseId),
    [scripts]
  );

  // Calculate Success and Failed counts based on scriptStatus
  const successCount = useMemo(
    () => scripts.filter((script) => script.scriptStatus === SCRIPT_STATUS.SUCCESS).length,
    [scripts]
  );

  const failedCount = useMemo(
    () => scripts.filter((script) => script.scriptStatus !== SCRIPT_STATUS.SUCCESS).length,
    [scripts]
  );

  const hasAnySelected = useMemo(
    () => Object.values(scriptSelections).some((s) => s.selected),
    [scriptSelections]
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
  };

  const handleTestCaseSelect = (selected: ISelectOption) => {
    setIsDropdownOpen(false);
    setSearchTerm(selected.label);
  };

  const handleCheckboxChange = (script: ScriptWithSelection) => {
    const key = script.selectionKey;

    setScriptSelections((prev) => {
      const updated = { ...prev };
      if (updated[key]?.selected) {
        delete updated[key];
        return updated;
      }
      updated[key] = {
        selected: true,
        selectedSuiteId: updated[key]?.selectedSuiteId,
        selectedSuiteName: updated[key]?.selectedSuiteName,
      };
      return updated;
    });
  };

  const handleSelectAll = () => {
    setScriptSelections((prev) => {
      const newSelections = { ...prev };
      scripts.forEach((script) => {
        const key = script.selectionKey;
        newSelections[key] = {
          selected: true,
          selectedSuiteId: newSelections[key]?.selectedSuiteId,
          selectedSuiteName: newSelections[key]?.selectedSuiteName,
        };
      });
      return newSelections;
    });
    setIsAllSelected(true);
  };
  const handleDeselectAll = () => {
    setScriptSelections((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        updated[key] = {
          ...updated[key],
          selected: false,
        };
      });
      return updated;
    });

    setIsAllSelected(false);
  };

  const getDownloadKey = (s: ScriptWithSelection) => String(s.testCaseId ?? '');

  const isScriptDownloadable = (script: ScriptWithSelection) =>
    script.scriptStatus === SCRIPT_STATUS.SUCCESS;

  const downloadableScripts = useMemo(
    () => scripts.filter(isScriptDownloadable),
    [scripts]
  );

  const selectedDownloadableKeys = useMemo(() => {
    return downloadableScripts
      .filter((script) => scriptSelections[script.selectionKey]?.selected)
      .map((script) => getDownloadKey(script));
  }, [downloadableScripts, scriptSelections]);

  const fallbackDownloadableKeys = useMemo(
    () => downloadableScripts.map((script) => getDownloadKey(script)),
    [downloadableScripts]
  );

  const hasDownloadableSelection =
    selectedDownloadableKeys.length > 0 || fallbackDownloadableKeys.length > 0;

  const handleDownloadSingle = async (script: ScriptWithSelection) => {
    const scriptKey = getDownloadKey(script);
    if (!tenantId || !trackerId || !scriptKey) return;

    try {
      setDownloadingById((prev) => ({ ...prev, [scriptKey]: true }));
      const blob = await downloadScriptFile({
        id: String(trackerId),
        tenantId: String(tenantId),
        isSelectedAll: false,
        testCaseTrackerId: String(trackerId),
        testCaseIds: [scriptKey],
      });
      const filename = generateScriptFilename(script.testCaseName, blob);
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingById((prev) => ({ ...prev, [scriptKey]: false }));
    }
  };

  const handleDownloadAll = async () => {
    if (!tenantId || !trackerId) return;

    const hasFailedSelection = scripts.some(
      (script) =>
        scriptSelections[script.selectionKey]?.selected &&
        !isScriptDownloadable(script)
    );

    if (hasFailedSelection) {
      toast.error(
        'Failed scripts cannot be downloaded. Deselect them to proceed.'
      );
      return;
    }

    const keysToDownload =
      selectedDownloadableKeys.length > 0
        ? selectedDownloadableKeys
        : fallbackDownloadableKeys;

    if (keysToDownload.length === 0) {
      toast.error('No successful scripts available for download.');
      return;
    }

    const keysToAnimate = keysToDownload;

    setDownloadingById((prev) => {
      const next = { ...prev };
      keysToAnimate.forEach((key) => {
        next[key] = true;
      });
      return next;
    });

    try {
      setIsDownloadingAll(true);
      const blob = await downloadScriptFile({
        id: String(trackerId),
        tenantId: String(tenantId),
        isSelectedAll: false,
        testCaseTrackerId: String(trackerId),
        testCaseIds: keysToDownload,
      });
      const filename = `scripts-${String(trackerId)}.zip`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloadingAll(false);
      setDownloadingById((prev) => {
        const next = { ...prev };
        keysToAnimate.forEach((key) => {
          next[key] = false;
        });
        return next;
      });
    }
  };

  const handleMoveToSuiteClick = (
    script: ScriptWithSelection,
    index: number
  ) => {
    if (showSuiteDropdown === index) {
      setShowSuiteDropdown(null);
      return;
    }
    if (script.applicationId) {
      setActiveApplicationId(script.applicationId);
    }
    setOpenMoveAllDropdown(false);
    setShowSuiteDropdown(index);
  };

  const selectedSuiteName = useCallback(
    (suiteId: string, suiteName: string, keys?: string[]) => {
      setScriptSelections((prev) => {
        const next = { ...prev };
        const targetKeys =
          keys && keys.length > 0 ? keys : scripts.map((s) => s.selectionKey);

        targetKeys.forEach((key) => {
          next[key] = {
            selected: prev[key]?.selected ?? false,
            selectedSuiteId: suiteId,
            selectedSuiteName: suiteName,
          };
        });

        return next;
      });
    },
    [scripts, setScriptSelections]
  );

  const handleSelectSuite = useCallback(
    (scriptIndex: number, suiteId: string, suiteName: string) => {
      const script = filteredScripts[scriptIndex];
      if (!script) return;
      selectedSuiteName(suiteId, suiteName, [script.selectionKey]);
      setShowSuiteDropdown(null);
      setMoveAllSuiteName('');
    },
    [filteredScripts, selectedSuiteName, setShowSuiteDropdown]
  );

  const handleToggleMoveAllDropdown = () => {
    const willOpen = !openMoveAllDropdown;
    setOpenMoveAllDropdown(willOpen);
    setShowSuiteDropdown(null);
    if (willOpen) {
      const applicationId = scripts[0]?.applicationId ?? '';
      if (applicationId) {
        setActiveApplicationId(applicationId);
      }
    }
  };

  const handleAddNewSuite = (suiteName: string) => {
    if (createTestSuite.isPending) return;
    if (!activeApplicationId) return;

    const trimmed = suiteName.trim();
    if (!isValidSuiteName(trimmed)) {
      const errorMessage =
        'Suite name must be CamelCase with no spaces or special characters (e.g., "TestSuite")';
      toast.error(errorMessage);
      return;
    }

    // Remember what to select once the suite exists on server
    if (showSuiteDropdown !== null) {
      pendingSelectionRef.current = {
        scope: SCOPE.SINGLE,
        index: showSuiteDropdown,
        name: trimmed,
      };
    } else if (openMoveAllDropdown) {
      pendingSelectionRef.current = { scope: SCOPE.ALL, name: trimmed };
    }

    onCreateTestSuite({
      applicationId: activeApplicationId,
      name: trimmed,
    });
  };

  const handleMoveAllToSuite = useCallback(
    (suiteId: string, suiteName: string) => {
      const targetKeys = scripts.map((script) => script.selectionKey);
      selectedSuiteName(suiteId, suiteName, targetKeys);
      setMoveAllSuiteName(suiteName);
      setOpenMoveAllDropdown(false);
    },
    [scripts, selectedSuiteName, setMoveAllSuiteName, setOpenMoveAllDropdown]
  );

  const handleCreateSuiteSuccess = useCallback(
    async (data: unknown) => {
      const newSuite = data as IApplicationTestCase;
      toast.success('Test suite created successfully');

      await refetchSuites();

      setSuites((prev) => {
        const exists = prev.some((suite) => suite.id === newSuite.id);
        if (exists) return prev;
        // Add validation: only add suite if it has both id and name
        if (!newSuite.id || !newSuite.name) return prev;
        return [...prev, { id: newSuite.id, name: newSuite.name }];
      });

      if (showSuiteDropdown !== null) {
        handleSelectSuite(showSuiteDropdown, newSuite.id, newSuite.name);
        return;
      }

      if (openMoveAllDropdown) {
        handleMoveAllToSuite(newSuite.id, newSuite.name);
      }
    },
    [
      refetchSuites,
      handleMoveAllToSuite,
      handleSelectSuite,
      openMoveAllDropdown,
      showSuiteDropdown,
      toast,
    ]
  );

  const handleCreateSuiteError = useCallback(
    (error: unknown) => {
      console.error('Failed to create suite:', error);
      toast.error('Failed to create test suite');
    },
    [toast]
  );

  const { onCreateTestSuite, createTestSuite } = useCreateTestSuiteMutation({
    onSuccess: handleCreateSuiteSuccess,
    onError: handleCreateSuiteError,
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moveAllDropdownRef.current &&
        !moveAllDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMoveAllDropdown(false);
      }
      // Check if click is outside any SuiteSearchDropdown
      const isClickInsideAnySuiteDropdown = Object.values(
        suiteDropdownRefs.current
      ).some((ref) => ref && ref.contains(event.target as Node));
      if (showSuiteDropdown !== null && !isClickInsideAnySuiteDropdown) {
        setShowSuiteDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuiteDropdown]);

  useEffect(() => {
    if (!suiteDetails?.length) return;
    setSuites((prevSuites) => {
      const serverSuites = suiteDetails.map((suite) => ({
        id: suite.id,
        name: suite.name,
      }));
      const localSuites = prevSuites.filter(
        (suite) =>
          !serverSuites.some((serverSuite) => serverSuite.id === suite.id)
      );
      return [...serverSuites, ...localSuites];
    });

    // After server refresh, if we have a pending selection by name
    if (pendingSelectionRef.current) {
      const { scope, index, name } = pendingSelectionRef.current;
      const found = suiteDetails.find(
        (s) => (s.name || '').toLowerCase().trim() === name.toLowerCase().trim()
      );
      if (found) {
        if (scope === SCOPE.SINGLE && index != null) {
          handleSelectSuite(index, found.id, found.name);
        } else if (scope === SCOPE.ALL) {
          handleMoveAllToSuite(found.id, found.name);
        }
        pendingSelectionRef.current = null;
      }
    }
  }, [suiteDetails, handleSelectSuite, handleMoveAllToSuite]);

  const totalCount = scripts.length;
  const selectedCount = Object.values(scriptSelections).filter(
    (s) => s.selected
  ).length;

  const allSelected = selectedCount === totalCount;

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onBack}
        className="bg-white w-full max-w-4xl mx-4 !p-0"
        isCloseButtonEnabled={true}
      >
        <div className="px-6 pt-6">
          <section>
            <div className="mt-1">
              <span className="font-bold">Generated Automation Scripts</span>(
              {successCount > 0 && `${successCount} Success`}
              {successCount > 0 && failedCount > 0 && ', '}
              {failedCount > 0 && `${failedCount} Failed`})
            </div>
          </section>
          <section className="my-3">
            <div className="relative">
              <SearchInput
                value={searchTerm}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
                onFocus={() => setIsDropdownOpen(true)}
                showLeftIcon
                showRightIcon={false}
                className="w-64"
              />
              <SearchDropdown
                isOpen={
                  isDropdownOpen &&
                  !!searchTerm &&
                  filteredScriptOptions.length > 0
                }
                applicationList={filteredScriptOptions}
                onSelect={handleTestCaseSelect}
              />
            </div>
          </section>
          <section>
            {isLoading ? (
              <ScrollPanel
                header={false}
                height="350px"
                contentClassName="pr-2"
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Card key={index} className="px-4 py-2 mb-3">
                    <SkeletonLoader
                      height="120px"
                      width="100%"
                      borderRadius="12px"
                      className="w-full"
                    />
                  </Card>
                ))}
              </ScrollPanel>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-red-500">
                  Error loading scripts: {error.message}
                </div>
              </div>
            ) : scripts.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">No scripts found</div>
              </div>
            ) : (
              <ScrollPanel
                header={false}
                height="350px"
                contentClassName="pr-2"
              >
                {filteredScripts.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">
                      No test cases found matching "{searchTerm}"
                    </div>
                  </div>
                ) : (
                  filteredScripts.map((script, index) => {
                    const isSuccess = script.scriptStatus === SCRIPT_STATUS.SUCCESS;
                    const isSelected = script.selected ?? false;
                    return (
                      <Card
                        key={script.id || index}
                        className={`px-4 py-2 mb-3 ${isSelected ? 'border-2' : ''}`}
                        isSelected={isSelected}
                      >
                        <div
                          className={`border rounded-full px-1.5 py-1 text-xs w-fit ms-auto ${
                            isSuccess
                              ? 'border-green-500 bg-green-50 text-green-900'
                              : 'border-red-500 bg-red-50 text-red-900'
                          }`}
                        >
                          {isSuccess
                            ? 'Automation Generated'
                            : 'Automation Generation Failed'}
                        </div>
                        <div className="flex gap-3">
                          <div className="flex items-center gap-2 my-2 mb-auto">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCheckboxChange(script)}
                              className="form-checkbox h-4 w-4 text-blue-600"
                              disabled={script.scriptStatus !== SCRIPT_STATUS.SUCCESS}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold">
                              {script.testCaseName}
                            </div>
                            <div className="text-xs text-gray-600 w-3/4">
                              {script.testCaseDescription}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-3">
                          <div
                            className="relative"
                            ref={(el) => {
                              if (el) {
                                suiteDropdownRefs.current[index] = el;
                              } else {
                                delete suiteDropdownRefs.current[index];
                              }
                            }}
                          >
                            {showSuiteDropdown === index ? (
                              <SuiteSearchDropdown
                                suites={suites}
                                selectedSuiteId={script.selectedSuiteId}
                                onSelectSuite={(suiteId, suiteName) =>
                                  handleSelectSuite(index, suiteId, suiteName)
                                }
                                onAddNewSuite={handleAddNewSuite}
                                onClose={() => setShowSuiteDropdown(null)}
                                className="w-64"
                              />
                            ) : (
                              <PrimaryButton
                                onClick={() =>
                                  handleMoveToSuiteClick(script, index)
                                }
                                className={`gap-2 text-sm px-4 py-2 ${
                                  script.selectedSuiteName
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                <span
                                  title={
                                    script.selectedSuiteName ?? 'Move to Suite'
                                  }
                                >
                                  {script.selectedSuiteName
                                    ? truncateText(script.selectedSuiteName)
                                    : 'Move to Suite'}
                                </span>
                                <ChevronWhite className="mt-1 h-5 w-5" />
                              </PrimaryButton>
                            )}
                          </div>
                          <DownloadButton
                            onClick={() => handleDownloadSingle(script)}
                            isLoading={
                              !!downloadingById[getDownloadKey(script)]
                            }
                            disabled={!isScriptDownloadable(script)}
                            className={`px-4 py-2 gap-2 text-sm cursor-pointer transition
                              ${downloadingById[getDownloadKey(script)] ? 'animate-pulse' : ''}
                            `}
                          />
                        </div>
                      </Card>
                    );
                  })
                )}
              </ScrollPanel>
            )}
          </section>
        </div>
        <div className="border-t pt-4 pb-6 px-6 border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SecondaryButton
                onClick={handleSelectAll}
                className="px-4 py-2 text-xs border-gray-300 text-gray-950"
                disabled={allSelected || isAllSelected}
              >
                Select all
              </SecondaryButton>
              <SecondaryButton
                onClick={handleDeselectAll}
                className="px-4 py-2 text-xs border-gray-300 text-gray-950"
                disabled={
                  !Object.values(scriptSelections).some(
                    (script) => script.selected
                  )
                }
              >
                Deselect all
              </SecondaryButton>
            </div>
            <div className="flex items-center gap-2">
              <DownloadButton
                onClick={handleDownloadAll}
                isLoading={isDownloadingAll}
                variant="secondary"
                disabled={!hasDownloadableSelection || isDownloadingAll}
                className={`px-4 py-2 text-xs flex items-center text-gray-950 border-gray-300 transition
                ${isDownloadingAll ? 'animate-pulse' : ''}
                `}
                iconPosition="left"
                iconClassName="text-gray-500 h-5 w-5"
              >
                {allSelected
                  ? 'Download all (.ZIP file)'
                  : hasAnySelected
                    ? 'Download selected (.ZIP file)'
                    : 'Download all (.ZIP file)'}
              </DownloadButton>
              <div className="relative" ref={moveAllDropdownRef}>
                <SecondaryButton
                  onClick={handleToggleMoveAllDropdown}
                  className="px-4 py-2 text-xs flex items-center text-gray-950 border-gray-300"
                  icon={<DownChevronGray />}
                  iconPosition="right"
                >
                  <span
                    title={
                      moveAllSuiteName
                        ? `${moveAllSuiteName}`
                        : 'Move all to Suite'
                    }
                  >
                    {moveAllSuiteName
                      ? `${truncateText(moveAllSuiteName)}`
                      : 'Move all to Suite'}
                  </span>
                </SecondaryButton>
                {openMoveAllDropdown && (
                  <div className="absolute right-0 bottom-full mb-1 z-10">
                    <SuiteSearchDropdown
                      suites={suites}
                      onSelectSuite={(suiteId, suiteName) =>
                        handleMoveAllToSuite(suiteId, suiteName)
                      }
                      onAddNewSuite={handleAddNewSuite}
                      onClose={() => setOpenMoveAllDropdown(false)}
                      className="w-64"
                      placement="up"
                    />
                  </div>
                )}
              </div>
              {submissionError && (
                <div className="text-sm text-red-600" role="alert">
                  {submissionError}
                </div>
              )}
              <PrimaryButton
                onClick={handleSubmitAssociations}
                className="px-6 py-2 text-sm"
                disabled={
                  associateMutation.isPending || scriptsWithSuites.length === 0
                }
              >
                Done
              </PrimaryButton>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
