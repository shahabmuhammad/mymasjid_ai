export interface Country {
  id: number;
  name: string;
}

export interface ApiError {
  memberNames: string[];
  errorMessage: string;
}

export interface ApiResponse<T> {
  hasError: boolean;
  message: string;
  statusCode: number;
  errors: ApiError[];
  model: T;
}

export interface City {
  id: number;
  name: string;
}

export interface Masjid {
  id: number;
  name: string;
  guidId: string;
  address: string;
  image: string;
  house: string;
  street: string;
  city: string;
  country: string;
  zipCode: string;
  messageCount: number;
}

export interface PublicMasjid {
  id: number;
  guidId: string;
  name: string;
  cityId: number;
  address: string;
  image: string;
  city: string;
  countryId: number;
  country: string;
  primaryLanguage: string;
  secondaryLanguage: string;
  isPublish: boolean;
  publishDateTime: string;
  creationTime: string;
}

export interface Pager {
  currentPageIndex: number;
  pageSize: number;
  totalRecordCount: number;
  pageCount: number;
}
export interface PublicFilteredMasjidResponse {
  masjidList: PublicMasjid[];
  pager: Pager;
}

export interface MasjidDetails {
  id: number;
  guidId: string;
  name: string;
  house: string;
  street: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  plDisplayName: string;
  slDisplayName: string;
  subHeading: string;
  comments: string;
  city: string;
  country: string;
  image: string;
  imageUrl: string;
  isPublish: boolean;
  organizationId: number;
  shortName: string;
  emailAddress: string;
  phoneNumber: string;
}

export interface MasjidSettings {
  isDstOn: boolean;
  jumahTime: string;
  isTimingsUploaded: boolean;
  showJumahTime: boolean;
  hijriOffset: number;
  jummahTimeEqualsZuhrTime: boolean;
  showTomorrowIqamahTimes: boolean;
  standardIqamahCalculation: boolean;
  showIqamahMinutesasTime: boolean;
  showHijriCalender: boolean;
  displayTimeIn12HourFormat: boolean;
  enableMarkers: boolean;
  playSoundBeforeIqamah: boolean;
  enableMultipleSalahTimings: boolean;
  enableArc: boolean;
}

export interface SalahItem {
  salahName: string;
  salahId: number;
  salahTime: string;
  iqamahTime: string;
  id: number;
  userSalahName: string;
}

export interface SalahTimings {
  masjidId: number;
  day: number;
  month: number;
  fajr: SalahItem[];
  zuhr: SalahItem[];
  asr: SalahItem[];
  maghrib: SalahItem[];
  isha: SalahItem[];
  shouruq: SalahItem[];
  sehri: SalahItem[];
  zawaal: SalahItem[];
}

export interface IqamahTimings {
  fajr: number;
  zuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  jumah: number;
  playSoundBeforeIqamah: boolean;
  showIqamahTime: boolean;
}

export interface TranslatedLabels {
  id: number;
  name: string;
  isRtl: boolean;
}

export interface JumahIqamahTiming {
  iqamahTimeMinutes: number;
  time: string;
  iqamahTime: string;
  isPrimary: boolean;
}

export interface OneWeekTimingsModel {
  masjidDetails: MasjidDetails;
  masjidSettings: MasjidSettings;
  salahTimings: SalahTimings[];
  iqamahTimings: IqamahTimings;
  primaryLanguage: any;
  secondaryLanguage: any;
  jumahSalahIqamahTimings: JumahIqamahTiming[];
  lastUpdatedAt: string;
}