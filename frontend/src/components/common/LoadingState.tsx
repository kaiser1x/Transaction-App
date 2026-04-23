import Card from './Card'

export default function LoadingState({ title = 'Loading Wayspend data...' }: { title?: string }) {
  return (
    <Card className="loading-state">
      <h2>{title}</h2>
      <p className="muted-text">Pulling the latest data and preparing the next screen.</p>
    </Card>
  )
}
