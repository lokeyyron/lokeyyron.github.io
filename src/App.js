import {useEffect, useRef, useState} from 'react';
import './App.css';

const photos = [
  {id:1, caption:'Our little dinner date.', alt:'Luke and Jane together at dinner with her bouquet'},
  {id:3, caption:'Kaning smile nimo.', alt:'Jane covering her smile beside Luke at the table'},
  {id:4, caption:'The little in-between moments.', alt:'Luke and Jane looking out beside the restaurant window'},
  {id:2, caption:'My favorite kind of company.', alt:'Jane resting her head against Luke under the night sky'},
  {id:5, caption:'Us, above the city lights.', alt:'Luke and Jane holding flowers on the balcony'},
  {id:6, caption:'A view worth remembering.', alt:'Luke with his arm around Jane as they look over the city'}
];
const letter = `I just wanna write this for gratitude. I am very happy jud satong date and I really wanna thank you for making it happen. Very pretty jud kayka and I really love your dress. Sorry gubot kayni na message kay gi write ra nako akong thoughts (para mas genuine?).

Pero real, I am always here and maybe dili nako ma show always pero dili nimo need mag worry nako. Dili jud ko kapoyon makig talk nimo and sometimes mag think rako na maybe need nimog space that’s why sometimes maybe ma feel nimo na dry kayko or walay gana.

If you ever need someone to lean on, cry on, talk with, or even just someone to be with in silence kay naa rajud ko. You have me through your ups and downs. Proud kayko nimo, strong jud kayka. I know lahi lahi tag ginadala dala pero proud jud kayko nimo. Padayon lang!`;
function App(){
  const [selected,setSelected] = useState(null);
  const [opened,setOpened] = useState(false);
  const dialog = useRef(null);
  useEffect(()=>{
    if(selected === null) return;
    const previous = document.activeElement;
    dialog.current.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=old; previous?.focus();};
  },[selected]);
  const close=()=>{dialog.current?.close();setSelected(null);};
  return <main>
    <section className="cover" aria-labelledby="title">
      <div className="cover-copy"><p className="dedication">For Jane, from Luke</p>
        <h1 id="title">Some nights<br/>stay <em>with you.</em></h1>
        <p className="intro">Salamat sa time, Jane.<br/>Still smiling about our little date.</p>
        <a className="album-link" href="#memories">Balikan nato? <span aria-hidden="true">↘</span></a>
      </div>
      <div className="cover-prints" aria-hidden="true">
        <div className="print behind"><img src="/photos/memory-3.jpg" alt=""/></div>
        <div className="print front"><img src="/photos/memory-5.jpg" alt=""/><span>you, me & the city lights ♡</span></div>
      </div>
      <div className="cover-star" aria-hidden="true">✳</div>
    </section>
    <section id="memories" className="memories" aria-labelledby="memories-title">
      <div className="album-heading"><div><p className="eyebrow">Kept close</p><h2 id="memories-title">Our little <em>collection.</em></h2></div><p>Good company. Little laughs.<br/>Mga moments nga worth balikan.</p></div>
      <div className="photo-grid">{photos.map((photo,index)=><figure key={photo.id} className={`memory memory-${index}`}>
        <button onClick={()=>setSelected(index)} aria-label={`Open photo: ${photo.caption}`}><img loading="lazy" src={`/photos/memory-${photo.id}.jpg`} alt={photo.alt}/><span className="zoom-hint" aria-hidden="true">take a closer look ↗</span></button>
        <figcaption>{photo.caption}</figcaption>
      </figure>)}</div>
      <p className="album-end">Same night. Six little reasons to smile. <span aria-hidden="true">♡</span></p>
    </section>
    {letter && <section className="letter-section"><button className="envelope" aria-expanded={opened} onClick={()=>setOpened(!opened)}><span>For you, Jane</span><span>{opened ? 'Fold the letter' : 'Open my little note'} ♡</span></button>{opened && <article className="letter"><h2>Hi Buseng,</h2><p>{letter}</p><p>Luke</p></article>}</section>}
    <footer><span>Salamat, Jane.</span><p>For making this a memory I get to keep.</p><span className="signature">Luke ♡</span></footer>
    {selected !== null && <dialog ref={dialog} className="lightbox" aria-label="Photo album" onCancel={close} onClick={e=>{if(e.target===e.currentTarget)close();}} onKeyDown={e=>{if(e.key==='ArrowRight')setSelected((selected+1)%photos.length);if(e.key==='ArrowLeft')setSelected((selected+photos.length-1)%photos.length);}}>
      <button className="close" onClick={close} autoFocus aria-label="Close photo">×</button>
      <img src={`/photos/memory-${photos[selected].id}.jpg`} alt={photos[selected].alt}/>
      <div className="lightbox-controls"><button aria-label="Previous photo" onClick={()=>setSelected((selected+photos.length-1)%photos.length)}>←</button><p>{photos[selected].caption}</p><button aria-label="Next photo" onClick={()=>setSelected((selected+1)%photos.length)}>→</button></div>
    </dialog>}
  </main>;
}
export default App;
