# LeaveRequestSystem Frontend
Frontend leave request system for employee in employee leave submission and approval tracking, human resource manage employee approvals within departments

## Related Repository
- Backend: https://github.com/buyyakhoo/LeaveRequestSystem-Backend
## Tech Stack
- TypeScript
- SvelteKit
- TailwindCSS
- DaisyUI

## User Manual
### Login Page (Every Role)
![Login Page 1](/readme_picture/Screenshot%202026-04-27%20175601.png)
### User
- Dashboard
![User Page 1](/readme_picture/Screenshot%202026-04-27%20175619.png)
- Leave Request (แจ้งลา)
![User Page 2](/readme_picture/Screenshot%202026-04-27%20175644.png)
- Leave History (ประวัติการลา)
![User Page 3](/readme_picture/Screenshot%202026-04-27%20175703.png)

### Manager (Human Resource)
- Dashboard
![Manager Page 1](/readme_picture/Screenshot%202026-04-27%20175723.png)
- Leave History (ประวัติการลา)
![Manager Page 2](/readme_picture/Screenshot%202026-04-27%20175734.png)
- All Employees (พนักงานทั้งหมด)
![Manager Page 3](/readme_picture/Screenshot%202026-04-27%20175753.png)
- Add Employee (เพิ่มพนักงาน)
![Manager Page 4](/readme_picture/Screenshot%202026-04-27%20175808.png)
- Resign Record (บันทึกการลาออก)
![Manager Page 5](/readme_picture/Screenshot%202026-04-27%20175824.png)
- Event Log
![Manager Page 6](/readme_picture/Screenshot%202026-04-27%20175844.png)

### Admin
- Dashboard
![Admin Page 1](/readme_picture/Screenshot%202026-04-27%20175901.png)
- Event Log
![Admin Page 2](/readme_picture/Screenshot%202026-04-27%20180005.png)
- Manager Promote (เลื่อนยศเป็นผู้จัดการทรัพยากรณ์มนุษย์)
![Admin Page 3](/readme_picture/Screenshot%202026-04-27%20180026.png)
- Manager Demote (ลดระดับจากผู้จัดการทรัพยากรณ์มนุษย์เป็นพนักงานในแผนกเดิม)
![Admin Page 4](/readme_picture/Screenshot%202026-04-27%20180045.png)
- Add Manager (เพิ่ม Manager)
![Admin Page 5](/readme_picture/Screenshot%202026-04-27%20180101.png)

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.12.8 create --template minimal --types ts --install npm frontend
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
