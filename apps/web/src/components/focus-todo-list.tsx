import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Input } from "@/components/input";
import { PlusIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

export type FocusTodo = {
	id: string;
	title: string;
	completed: boolean;
};

const MAX_ACTIVE_TASKS = 7;

export function FocusTodoList({
	todos,
	onAddTodo,
	onToggleTodo,
	onDeleteTodo,
}: {
	todos: FocusTodo[];
	onAddTodo?: (title: string) => void;
	onToggleTodo?: (id: string) => void;
	onDeleteTodo?: (id: string) => void;
}) {
	const [title, setTitle] = useState("");
	const activeCount = todos.filter((todo) => !todo.completed).length;
	const canAdd = title.trim().length > 0 && activeCount < MAX_ACTIVE_TASKS;

	const addTodo = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canAdd) return;
		onAddTodo?.(title.trim());
		setTitle("");
	};

	return (
		<section aria-labelledby="focus-todos-heading">
			<form className="mt-4 flex gap-2" onSubmit={addTodo}>
				<Input
					value={title}
					maxLength={120}
					placeholder="Add a task..."
					aria-label="New focus task"
					onChange={(event) => setTitle(event.target.value)}
					className="h-10 font-sans border-white/20 bg-white/10 text-white placeholder:text-white/45 focus-visible:ring-white/30"
				/>
				<Button
					type="submit"
					disabled={!canAdd}
					aria-label="Add task"
					className="h-10 font-sans bg-white  text-black hover:bg-white/90">
					<PlusIcon />
					<span className="hidden sm:inline">New task</span>
				</Button>
			</form>

			<div className="mt-6 space-y-1" aria-live="polite">
				{todos.length === 0 ? (
					<div className="flex min-h-20 items-center justify-center rounded-lg border border-dashed border-white/15 text-sm font-sans text-white/45">
						No tasks yet
					</div>
				) : (
					todos.map((todo) => (
						<div
							key={todo.id}
							className="group flex min-h-10 items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-white/10 hover:bg-white/5">
							<Checkbox
								checked={todo.completed}
								onCheckedChange={() => onToggleTodo?.(todo.id)}
								aria-label={`Mark ${todo.title} ${todo.completed ? "incomplete" : "complete"}`}
								className="border-white/35 bg-white/10 data-checked:border-white data-checked:bg-white data-checked:text-black"
							/>
							<span
								className={
									todo.completed
										? "min-w-0 flex-1 break-words text-sm text-white/40 line-through"
										: "min-w-0 flex-1 break-words text-sm text-white/85"
								}>
								{todo.title}
							</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label={`Delete ${todo.title}`}
								onClick={() => onDeleteTodo?.(todo.id)}
								className="text-white/40 opacity-70 hover:bg-white/10 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
								<TrashBinLinear color="red" />
							</Button>
						</div>
					))
				)}
			</div>
		</section>
	);
}
