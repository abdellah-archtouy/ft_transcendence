import React from 'react'
import RemoteLocal from "../RemoteLocal"

const Tournament = () => {
  const links = ["/game/tournament/local", "/game/tournament/"]
  return (
    <div>
      <RemoteLocal header={["Tournament"]} links={links} />
    </div>
  )
}

export default Tournament
