import { useParams } from 'react-router-dom'
import PartyAgeing1 from '../components/party/PartyAgeing2'
import PartyForcastAndGrowth from '../components/party/PartyForcastAndGrowth'
import PartyPendingOrders from '../components/party/PartyPendingOrders'
import PartyAgeing2 from '../components/party/PartyAgeing2'
import PartyClientSale from '../components/party/partyClientSale'
import CurrentStock from '../components/party/CurrentStock'

export default function PartyPage() {
  const { party } = useParams()
  return (
    <>
      {party && <PartyForcastAndGrowth party={party} />}
      {party && <PartyPendingOrders party={party} />}
      {party && <PartyAgeing1 party={party} />}
      {party && <PartyAgeing2 party={party} />}
      {party && <PartyClientSale party={party} />}
      {party && <CurrentStock party={party} />}
    </>

  )

}

