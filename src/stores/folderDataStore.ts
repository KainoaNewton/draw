import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FolderData = {
  [folder_id: string]: {
    name: string;
    updatedAt: string;
    user_id: string;
    created_at: string;
  };
};

type FolderDataStore = {
  data: FolderData;
  setFolderData: (
    folder_id: string,
    name: string,
    updatedAt: string,
    user_id: string,
    created_at?: string,
  ) => void;
  getFolderData: (folder_id: string) => FolderData[string] | undefined;
  removeFolderData: (folder_id: string) => void;
  getAllFolders: () => FolderData[string][];
  clearUserFolders: (user_id: string) => void;
};

const folderDataStore = create<FolderDataStore>()(
  persist(
    (set, get) => ({
      data: {},
      setFolderData: (folder_id, name, updatedAt, user_id, created_at) =>
        set((state) => {
          const currentData = state.data[folder_id];
          if (
            !currentData ||
            new Date(updatedAt) > new Date(currentData.updatedAt)
          ) {
            return {
              data: {
                ...state.data,
                [folder_id]: { 
                  name, 
                  updatedAt, 
                  user_id,
                  created_at: created_at || currentData?.created_at || updatedAt
                },
              },
            };
          }
          return state;
        }),
      getFolderData: (folder_id) => get().data[folder_id],
      removeFolderData: (folder_id) =>
        set((state) => {
          const newData = { ...state.data };
          delete newData[folder_id];
          return { data: newData };
        }),
      getAllFolders: () => Object.values(get().data),
      clearUserFolders: (user_id) =>
        set((state) => {
          const newData = { ...state.data };
          Object.keys(newData).forEach(folder_id => {
            if (newData[folder_id].user_id === user_id) {
              delete newData[folder_id];
            }
          });
          return { data: newData };
        }),
    }),
    {
      name: "folder-data-store",
    },
  ),
);

export { folderDataStore };
