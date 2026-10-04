import React, { createContext, useContext, useState, useEffect } from 'react';
import { CollegeId, College } from '../types';
import { collegesData } from '../data/mockData';

const loadCollegesFromStorage = (): College[] => {
  try {
    const item = localStorage.getItem('sh_colleges');
    return item ? JSON.parse(item) : collegesData;
  } catch {
    return collegesData;
  }
};

interface CollegeContextType {
  college: CollegeId;
  setCollege: (college: CollegeId) => void;
  activeCollege: College;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (college: CollegeId) => void;
  resetOnboarding: () => void;
  allColleges: College[];
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export const CollegeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allColleges, setAllColleges] = useState<College[]>(loadCollegesFromStorage);

  useEffect(() => {
    // Sync colleges when they are changed in localStorage
    const handleStorageChange = () => {
      setAllColleges(loadCollegesFromStorage());
    };
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom college sync events
    window.addEventListener('sh_colleges_sync', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sh_colleges_sync', handleStorageChange);
    };
  }, []);

  const [college, setCollegeState] = useState<CollegeId>(() => {
    const saved = localStorage.getItem('studenthub_selectedCollege') as CollegeId;
    const currentList = loadCollegesFromStorage();
    return saved && currentList.some((c) => c.id === saved) ? saved : (currentList[0]?.id || 'engineering');
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('studenthub_onboarding_done') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('studenthub_selectedCollege', college);
  }, [college]);

  const setCollege = (newCollege: CollegeId) => {
    setCollegeState(newCollege);
  };

  const completeOnboarding = (selectedCollege: CollegeId) => {
    setCollegeState(selectedCollege);
    setHasCompletedOnboarding(true);
    localStorage.setItem('studenthub_onboarding_done', 'true');
    localStorage.setItem('studenthub_selectedCollege', selectedCollege);
  };

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false);
    localStorage.removeItem('studenthub_onboarding_done');
  };

  const activeCollege = allColleges.find((c) => c.id === college) || allColleges[0] || collegesData[0];

  return (
    <CollegeContext.Provider
      value={{
        college,
        setCollege,
        activeCollege,
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboarding,
        allColleges,
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => {
  const context = useContext(CollegeContext);
  if (!context) throw new Error('useCollege must be used within CollegeProvider');
  return context;
};
