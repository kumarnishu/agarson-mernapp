import { useParams } from 'react-router-dom'
import PartyAgeing1 from '../components/party/PartyAgeing1'

export default function PartyPage() {
  const { party } = useParams()
  return (
    <>
      {party && <PartyAgeing1 party={party} />}
    </>

  )

}

