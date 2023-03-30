import Head from 'next/head'
import React, { useState } from 'react'
import { DndContext } from '@dnd-kit/core'

import Dropzone from './components/Dropzone'
import Login from './components/Login'
import Register from './components/Register'

export default function Home() {
  const [parent, setParent] = useState(null)

  const draggable = (<Login id="draggable" />)

  return (
    <div id='droppable'>
      <Head>
        <title>Communix</title>
        <meta
          name='description'
          content='Video chatting for nerds'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='main white-grid' >
        <header className='bg-communixWhite p-8 inline-block' >
          <h1 className='text-7xl font-dm'><span className='text-communixPurple'>Com</span><span className='text-communixGreen'>mu</span><span className='text-communixRed'>nix</span></h1>
        </header>
      </main>
      <DndContext onDragEnd={handleDragEnd}>
        {!parent ? draggable : null}
        <Dropzone id="droppable">
          {parent === "droppable" ? draggable : 'Drop here'}
        </Dropzone>
      </DndContext>
    </div>
  );

  function handleDragEnd({ over }) {
    setParent(over ? over.id : null)
  }
}
