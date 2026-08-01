import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/focus-mode')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/focus-mode"!</div>
}
