import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { isActivePath } from '@/lib/menu';
import { NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export function NavMain({ items = [] }: { items: NavGroup[] }) {
    const page = usePage();

    return (
        <>
            {items.map((group, index) => (
                <Collapsible defaultOpen key={index} className="group/collapsible-group">
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel asChild>
                            <CollapsibleTrigger className="cursor-pointer text-sm">
                                {group.title}
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible-group:rotate-90" />
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                            <SidebarMenu>
                                {group.items.map((item, subIndex) =>
                                    item.items && item.items.length > 0 ? (
                                        <Collapsible className="group/collapsible" key={index + '-' + subIndex}>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton tooltip={item.title}>
                                                            {item.icon && <item.icon className="size-4" />}
                                                            <span>{item.title}</span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                </SidebarMenuButton>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items.map((subItem, subSubIndex) => (
                                                            <SidebarMenuSubItem key={index + '-' + subIndex + '-' + subSubIndex}>
                                                                <SidebarMenuSubButton asChild>
                                                                    <Link href={subItem.href || '#'} preserveState>
                                                                        {subItem.icon && (
                                                                            <span>
                                                                                <subItem.icon className="size-4" />
                                                                            </span>
                                                                        )}
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuItem key={index + '-' + subIndex}>
                                            <SidebarMenuButton asChild isActive={isActivePath(page.url, item.href)}>
                                                <Link href={item.href || '#'} preserveState>
                                                    {item.icon && <item.icon className="size-4" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ),
                                )}
                            </SidebarMenu>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
            ))}
        </>
    );
}
