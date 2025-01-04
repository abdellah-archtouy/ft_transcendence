import React from 'react'
import RemoteLocal from "../remoteLocal/RemoteLocal"

const Tournament = () => {
  const links = ["/game/tournament/local", "/game/tournament/remote"]
  return (
    <div>
      <RemoteLocal header={["Tournament"]} links={links} />
    </div>
  )
}

export default Tournament
