# Front End for BIRCH

---

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | React 18.2 (CRA) |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS + DaisyUI |
| HTTP Client | Axios |
| Auth | Firebase Auth (Google Sign-In, `ihrail.com` only) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Tables | MaterialReactTable, React DataTable, inovua ReactDataGrid |
| Charts | Chart.js via react-chartjs-2 |
| Dropdowns | react-select |
| Toasts | react-toastify |
| Date Handling | dayjs, moment, react-datepicker |
| Excel Import/Export | read-excel-file, xlsx, export-to-csv |

---

## Getting Started

```bash
npm install --force
npm start
```

> `--force` is needed due to peer dependency conflicts.

### Build

```bash
GENERATE_SOURCEMAP=false npm run build
```

---

## Environment Variables

Create a `.env` file in the project root:

| Variable | Description |
| --- | --- |
| `REACT_APP_BIRCH_API_URL` | Backend API base URL |


---

## Project Structure

```
src/
├── App.js                      # Root component (auth state, FCM, Navbar)
├── index.js                    # Entry point, route definitions, service worker
├── firebase.js                 # Firebase config (auth, messaging, GoogleAuthProvider)
├── auth/                       # Authentication
│   ├── Auth.js                 # Auth layout wrapper
│   └── login/Login.js          # Google Sign-In page
├── components/                 # Reusable UI components (modals, tables, charts)
├── portal/                     # Page-level components
│   ├── navbar/Navbar.js        # Main navigation (role-based menu)
│   ├── database/Database.js    # Database management
│   ├── Home/                   # Order views (Active, All, Maintenance, Template, EnRoute)
│   ├── management/             # Crew, User, Attendance, Routing, Payroll
│   ├── report/                 # 20+ report pages
│   └── time/                   # Time tracking & approval
├── utils/                      # Helpers & hooks
│   ├── CommonHelper.js         # Array ops, toast, role check, hasRole()
│   ├── NumberHelper.js         # round2Dec()
│   ├── DateTimeHelper.js       # Date formatting (America/Chicago timezone)
│   ├── aarHelper.js            # AAR 500-byte record generation
│   ├── qbHelper.js             # TSheets/QuickBooks integration
│   ├── documentPrintHelper.js  # Print/PDF generation
│   ├── getColumn.js            # DataTable column config builder
│   ├── ProtectedRoute.js       # Auth guard component
│   └── useDebounce.js          # Debounce hook
└── DataSets/                   # Static JSON data
```

---

## Authentication

- **Provider**: Firebase Auth with Google Sign-In
- **Domain restriction**: Only `ihrail.com` accounts
- **Flow**: Google Sign-In → Firebase auth → backend API login → token stored in localStorage
- **Route protection**: `ProtectedRoute` wraps all routes, redirects to `/auth/login` if unauthenticated
- **Logout**: `auth.signOut()` + `localStorage.clear()` (in Navbar)

---

## Routes

| Path | Component | Description |
| --- | --- | --- |
| `/` | ActiveOrders | Default — active work orders |
| `/all_orders` | AllOrders | All work orders |
| `/maintenance` | MaintenanceOrders | Maintenance orders |
| `/template` | TemplateOrders | Template orders |
| `/enoute_dispo` | EnRouteDispoOrders | En-route/disposition orders |
| `/database` | Database | Database management |
| `/routing_matrix` | RoutingMatrixEditor | Routing matrix editor |
| `/team_member_management` | CrewManagement | Crew/team management |
| `/user_management` | UserManagement | User accounts |
| `/attendance` | Attendance | Attendance tracking |
| `/payroll` | ReportDates | Payroll report dates |
| `/work_station` | WorkStationManager | Workstation time tracking |
| `/time_approval` | TimeApproval | Time log approval |
| `/department_report` | DepartmentReport | Department report |
| `/department_checklist_report` | DepartmentChecklistReport | Department checklist |
| `/department_time_report` | TimeLogByDepartment | Time log by department |
| `/department_time_remaining_report` | DepartmentAccumulationReport | Dept time remaining |
| `/summary_report` | SummaryReportMaterial | Summary/material report |
| `/part_report` | PartReport | Parts report |
| `/emission_report` | EmissionReport | Emission report |
| `/storage_report` | StorageReport | Storage report |
| `/qb_time_compare` | TimeCompare | QuickBooks time compare |
| `/qb_parts` | QbParts | QB parts |
| `/stock_status_report` | StockStatusReport | Stock status |
| `/rev_by_customer` | RevenueByCustomer | Revenue by customer |
| `/rev_by_department` | RevenueByDepartments | Revenue by department |
| `/revenue_recognition` | RevenueRecognition | Revenue recognition |
| `/revenue_recognition_by_department` | RevenueRecognitionByDepartment | Rev recognition by dept |
| `/revenue_recognition_by_inventory` | RevenueRecognitionInventroy | Rev recognition by inventory |
| `/indirect_hour_report` | IndirectHour | Indirect hours |
| `/utilization_report` | UtilizationReport | Utilization report |
| `/billing_efficiency` | BillingEfficiency | Billing efficiency |
| `/billed_cars` | BilledCars | Billed cars |
| `/dis_report` | DISReport | DIS report |
| `/profitability_report` | ProfitabilityReport | Profitability report |

---

## Role-Based Access

Roles are checked via `hasRole(roleName)` from `CommonHelper.js`. The Navbar conditionally renders menu items based on the user's roles.

| Role | Access |
| --- | --- |
| `ADMIN` | Full access |
| `HR` | HR features |
| `TECH` | Technician features |
| `MANAGEMENT` | Management reports & dashboards |
| `TIME APPROVAL` | Time log approval |
| `PAYROLL` | Payroll/report dates |

---

## Utility Functions

### CommonHelper.js
- `showToastMessage(type, message)` — show toast notification
- `hasRole(roleName)` — check user role from localStorage
- `updateObjectById(arr, id, updates)` — update object in array by ID
- `removeObjectByProperty(arr, prop, value)` — remove from array
- `disableButtonsDuringAsync(buttonId, asyncFn)` — disable button during API call

### NumberHelper.js
- `round2Dec(value)` — round to 2 decimal places

### DateTimeHelper.js (all dates use America/Chicago timezone)
- `convertSqlToFormattedDate(date)` — SQL → `MM-DD-YYYY`
- `convertSqlToFormattedDateTime(date)` — SQL → `MM-DD-YYYY HH:mm:ss`
- `formatDateToSQL(date)` — Date → `YYYY-MM-DD`
- `addDays(date, days)` — add days to SQL date

### aarHelper.js
- `calculateLaborCost(job)` — labor cost with responsibility code 3 logic
- `printAAR(workOrder, options)` — generates 500-byte AAR records

---

## Labor Cost Calculation

This logic appears in multiple places (`EditJobModal`, `aarHelper`, reports):

- **Responsibility code 3**: Fixed + Variable rate
  - `qty = 1`: `(qty × fixedRate × fixedTime) + (qty × varRate × varTime)`
  - `qty > 1`: `(1 × fixedRate × fixedTime) + (qty × varRate × varTime)`
- **Other codes**: Variable only → `qty × varRate × varTime`

---

## Styling

### Theme Colors
| Token | Value | Usage |
| --- | --- | --- |
| `#002E54` | Theme Blue | Buttons, borders, primary brand |
| `#DCE5FF` | Light Blue | Section headers, highlights |

### Tailwind Breakpoints
- `sm`: 100px, `md`: 700px, `lg`: 1400px

### Common Patterns
- Buttons: `bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 rounded-md`
- Inputs: `p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2`
- Section headers: `bg-[#DCE5FF] rounded-md px-2 h-10`
- Modal backdrop: `fixed bg-[#2e2b2b40] backdrop-blur-sm z-[100]`

---



## Conventions

- All API calls use `axios` with `REACT_APP_BIRCH_API_URL` as base
- Loading states use `react-toastify` loading toasts
- Console output suppressed in production
- Memoize react-select options with `useMemo` and use custom `filterOption` for performance
- Dates assume America/Chicago timezone throughout

