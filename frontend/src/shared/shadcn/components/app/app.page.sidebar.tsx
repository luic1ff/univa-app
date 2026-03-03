import * as React from "react"

import { AppPageNavMain } from "@/shared/shadcn/components/app/app.page.nav-main.tsx"
import { AppPageNavUser } from "@/shared/shadcn/components/app/app.page.nav-user.tsx"
import { AppPageSidebarLogo } from "@/shared/shadcn/components/app/app.page.sidebar-logo.tsx"
import { SidebarCalendar } from "@/shared/shadcn/components/app/sidebar-calendar.tsx"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/shared/shadcn/ui/sidebar.tsx"

import {
    LayoutDashboardIcon,
    CalendarDaysIcon,
    FolderOpenIcon,
    MessagesSquareIcon,
    BotIcon,
    ListChecksIcon,
    Settings2Icon,
} from "lucide-react"

import { useAuthUser } from "@/entities/user/model/useAuthUser"

const navMain = [
    {
        title: "Дашборд",
        url: "/dashboard",
        icon: <LayoutDashboardIcon />,
        isActive: true,
        items: [],
    },
    {
        title: "Розклад",
        url: "/dashboard/schedule",
        icon: <CalendarDaysIcon />,
        items: [
            { title: "Календар", url: "/dashboard/schedule/calendar" },
            { title: "Предмети", url: "/dashboard/schedule/subjects" },
        ],
    },
    {
        title: "Файли",
        url: "/dashboard/files",
        icon: <FolderOpenIcon />,
        items: [],
    },
    {
        title: "Чати",
        url: "/dashboard/chats",
        icon: <MessagesSquareIcon />,
        items: [],
    },
    {
        title: "AI-помічник",
        url: "/dashboard/ai",
        icon: <BotIcon />,
        items: [],
    },
    {
        title: "Органайзер",
        url: "/dashboard/organizer",
        icon: <ListChecksIcon />,
        items: [
            { title: "To-do", url: "/dashboard/organizer/to-do" },
            { title: "Нотатки", url: "/dashboard/organizer/notes" },
        ],
    },
    {
        title: "Налаштування",
        url: "/dashboard/settings",
        icon: <Settings2Icon />,
        items: [],
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = useAuthUser()

    const navUser = {
        name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "...",
        email: user?.email ?? "",
        avatar: user?.avatarPath ?? "",
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <AppPageSidebarLogo />
            </SidebarHeader>
            <SidebarContent>
                <SidebarCalendar />
                <AppPageNavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                <AppPageNavUser user={navUser} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
