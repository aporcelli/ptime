// types/google-picker.d.ts
interface Window {
  gapi: {
    load: (api: string, config: { callback?: (() => void) | undefined } | any) => void;
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
