// types/google-picker.d.ts
// Type declarations for Google Picker API + gapi client

interface Window {
  gapi: {
    load: (api: string, config: { callback?: () => void } | any) => void;
  };
  google: {
    picker: {
      DocsView: new (viewId: any) => any;
      DocsViewMode: { LIST: any };
      ViewId: { SPREADSHEETS: any };
      PickerBuilder: new () => any;
      Action: { PICKED: any; CANCEL: any };
    };
  };
}
