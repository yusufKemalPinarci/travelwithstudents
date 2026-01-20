import Button from './Button.tsx'

export default function SocialLoginButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="ghost" className="w-full border bg-white">
        <span className="text-sm">Google</span>
      </Button>
      <Button variant="ghost" className="w-full border bg-white">
        <span className="text-sm">Facebook</span>
      </Button>
    </div>
  )
}
