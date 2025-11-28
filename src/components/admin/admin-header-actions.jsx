'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

function SearchIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}

export default function AdminHeaderActions() {
    const router = useRouter();

    const handleLogout = () => {
        router.push('/');
    };

    return (
        <>
            <div className="relative ml-auto flex-1 md:grow-0">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                    className="w-full rounded-lg bg-white pl-8 md:w-[200px] lg:w-[320px] dark:bg-gray-950"
                    placeholder="Search..."
                    type="search"
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="overflow-hidden rounded-full" size="icon" variant="outline">
                        <img
                            alt="Avatar"
                            className="overflow-hidden rounded-full"
                            height={36}
                            src="/placeholder.svg"
                            style={{
                                aspectRatio: "36/36",
                                objectFit: "cover",
                            }}
                            width={36}
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
