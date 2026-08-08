import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/sidebar";
import { useSidebar } from "@/components/sidebar";
import { Kbd } from "@/components/kbd";
import { Link, useLocation } from "@tanstack/react-router";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: any;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const pathname = useLocation({
		select: (location) => location.pathname,
	});
	const { isMobile, setOpenMobile } = useSidebar();

	const handleLinkClick = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	const activeItemClassName = "text-primary hover:bg-transparent hover:text-primary";
	const itemClassName = "hover:bg-transparent hover:text-primary";
	const iconClassName = "size-4! text-current";

	const shortcuts: Record<string, string> = {
		"Block List": "B",
		Insights: "I",
		Settings: "S",
	};

	return (
		<SidebarGroup className="py-0 my-0 mt-2">
			<SidebarMenu className="gap-3">
				{items.map((item) => {
					const isMainItemActive = pathname === item.url;

					return (
						<div key={item.title}>
							<SidebarMenuItem>
								<SidebarMenuButton
									render={
										<Link
											to={item.url}
											aria-current={
												isMainItemActive
													? "page"
													: undefined
											}
											onClick={handleLinkClick}
										/>
									}
									isActive={isMainItemActive}
									tooltip={item.title}
									className={
										isMainItemActive
											? activeItemClassName
											: itemClassName
									}>
									{item.icon && (
										<item.icon
											color="currentColor"
											className={iconClassName}
										/>
									)}
									<span
										className={
											isMainItemActive
												? "font-medium"
												: ""
										}>
										{item.title}
									</span>
									{shortcuts[item.title] && (
										<Kbd className="ml-auto border bg-background group-data-[collapsible=icon]:hidden">
											{shortcuts[item.title]}
										</Kbd>
									)}
								</SidebarMenuButton>
								<div className="">
									{item.items?.map((subItem) => {
										const isSubItemActive =
											pathname === subItem.url;

										return (
											<SidebarMenuButton
												key={subItem.title}
												render={
													<Link
														to={subItem.url}
														aria-current={
															isSubItemActive
																? "page"
																: undefined
														}
														onClick={
															handleLinkClick
														}
													/>
												}
												isActive={isSubItemActive}
												className={
													isSubItemActive
														? activeItemClassName
														: itemClassName
												}>
												<span
													className={
														isSubItemActive
															? "font-medium"
															: ""
													}>
													{subItem.title}
												</span>
											</SidebarMenuButton>
										);
									})}
								</div>
							</SidebarMenuItem>
						</div>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
