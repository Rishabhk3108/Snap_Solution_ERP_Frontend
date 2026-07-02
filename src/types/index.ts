export interface User {
  id: number;
  username: string;
  fullname: string;
  role: string;
  active: number;
  jobTitle?: string;
  reportid?: string;
  roleId?: number;
  departmentId?: number;
  startDate?: string;
  endDate?: string;
  remark?: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface PersonalInfo {
  id?: number;
  userId: number;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  fatherName?: string;
  idNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  mobile?: string;
  phone?: string;
  emailAddress?: string;
}

export interface FinancialInfo {
  id?: number;
  userId: number;
  employmentType?: string;
  salaryBasic?: number;
  salaryGross?: number;
  salaryNet?: number;
  allowanceHouseRent?: number;
  allowanceMedical?: number;
  allowanceSpecial?: number;
  allowanceFuel?: number;
  allowancePhoneBill?: number;
  allowanceOther?: number;
  allowanceTotal?: number;
  deductionProvidentFund?: number;
  deductionTax?: number;
  deductionOther?: number;
  deductionTotal?: number;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  iban?: string;
  otStatus?: string;
  esicStatus?: string;
  OtWorkingHours?: number;
}

export interface EmployeeInfo {
  id?: number;
  emailAddress?: string;
  Aadhaar_number?: string;
  pan_number?: string;
  esic_number?: string;
  pf_number?: string;
  nominee_name?: string;
  nominee_relation?: string;
}

export interface Attendance {
  id: number;
  empid: number;
  project_id: number;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  number_of_hours?: number;
  ot_hours?: number;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
}

export interface TodaySummary {
  present: number;
  absent: number;
  total: number;
  percentage?: number;
}
