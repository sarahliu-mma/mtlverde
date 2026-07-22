"use client";
import Header from "../Header";

const P={
  hero:"https://images.unsplash.com/photo-1445296608114-4b8fabe48256?fm=jpg&w=1600&q=85&auto=format&fit=crop",
  p1:"https://images.unsplash.com/photo-1741102758556-6f7f749d5085?fm=jpg&w=1200&q=80&auto=format&fit=crop",
  p2:"https://images.unsplash.com/photo-1529775768124-fb874e73ac7e?fm=jpg&w=1200&q=80&auto=format&fit=crop",
  p3:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?fm=jpg&w=1200&q=80&auto=format&fit=crop",
  p4:"https://images.unsplash.com/photo-1581408864626-43a5394853de?fm=jpg&w=1200&q=80&auto=format&fit=crop",
};

const G="#1e4d2b";

const CSS=`
*{box-sizing:border-box;margin:0;padding:0}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
.sp{display:grid;grid-template-columns:1fr 1fr;height:80vh;max-height:720px;border-bottom:1px solid #e8e8e8}
.sp .si{overflow:hidden}
.sp .si img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}
.sp .st{display:flex;flex-direction:column;justify-content:center;padding:64px 72px;background:#fff}
.fb{position:relative;height:80vh;max-height:720px;border-bottom:1px solid #e8e8e8;overflow:hidden}
.fb img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}
.fb .ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78) 0%,rgba(0,0,0,.35) 50%,transparent 100%)}
.fb .st{position:absolute;bottom:0;left:0;padding:0 72px 60px;max-width:700px}
.sn{font-size:14px;font-weight:400;letter-spacing:1px;margin-bottom:14px;display:block}
.sh{font-size:clamp(32px,4.5vw,62px);font-weight:900;line-height:1.02;letter-spacing:-2px;margin-bottom:20px}
.sb{font-size:16px;line-height:1.75;max-width:440px}
.fl{display:block;font-size:13px;color:rgba(255,255,255,.4);margin-bottom:12px;text-decoration:none;transition:color .2s}
.fl:hover{color:rgba(255,255,255,.85)}
@media(max-width:900px){
  .sp{grid-template-columns:1fr;height:auto;max-height:none}
  .sp .si{height:56vw;min-height:220px}
  .sp .st{padding:40px 24px 52px}
  .fb{height:70vw;min-height:320px;max-height:none}
  .fb .st{padding:0 24px 40px}
  .sg{grid-template-columns:repeat(2,1fr)}
}
`;

export default function MissionClient({ lang, dict }) {
  const m = dict.mission;

  const STATS=[
    {n:"3,000+",label:m.heading},
    {n:"20", label:m.problemTitle},
    {n:"50,000", label:m.whatTitle},
    {n:"100%", label:m.visionTitle},
  ];

  const SECS=[
    {n:"01",t:m.problemTitle,b:m.problem,i:P.p1,f:false},
    {n:"02",t:m.whatTitle,b:m.what,i:P.p2,f:true},
    {n:"03",t:m.visionTitle,b:m.vision,i:P.p3,f:false},
    {n:"04",t:m.dataTitle,b:m.data,i:P.p4,f:true},
  ];

  return (
    <div style={{fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif",background:"#fff",color:"#111"}}>
      <style>{CSS}</style>

      <Header dict={dict} lang={lang} />

      <section style={{position:"relative",height:"55vh",minHeight:380,display:"flex",alignItems:"center"}}>
        <img src={P.hero} alt="Montreal" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 60%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(30,77,43,.9) 0%,rgba(0,0,0,.55) 55%,rgba(181,40,28,.4) 100%)"}}/>
        <div style={{position:"relative",zIndex:2,padding:"0 8vw",maxWidth:800}}>
          <h1 style={{fontSize:"clamp(36px,5vw,66px)",fontWeight:900,lineHeight:1.05,letterSpacing:"-2px",color:"#fff",marginBottom:18}}>{m.heading}</h1>
          <p style={{fontSize:"clamp(14px,1.8vw,18px)",color:"rgba(255,255,255,.82)",lineHeight:1.8,maxWidth:580}}>{m.statement}</p>
        </div>
      </section>

      <section style={{background:G,padding:"60px 8vw"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div className="sg">
            {STATS.map(s=>(
              <div key={s.n} style={{textAlign:"center"}}>
                <p style={{fontSize:"clamp(28px,3.5vw,48px)",fontWeight:900,color:"#fff",letterSpacing:"-1px",marginBottom:8}}>{s.n}</p>
                <p style={{fontSize:11,color:"rgba(255,255,255,.55)",fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px"}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        {SECS.map(sec=>sec.f?(
          <div key={sec.t} className="fb">
            <img src={sec.i} alt={sec.t}/>
            <div className="ov"/>
            <div className="st">
              <span className="sn" style={{color:"rgba(255,255,255,.65)"}}>{sec.n}</span>
              <h2 className="sh" style={{color:"#fff"}}>{sec.t}</h2>
              <p className="sb" style={{color:"rgba(255,255,255,.82)"}}>{sec.b}</p>
            </div>
          </div>
        ):(
          <div key={sec.t} className="sp">
            <div className="si"><img src={sec.i} alt={sec.t}/></div>
            <div className="st">
              <span className="sn" style={{color:"#999"}}>{sec.n}</span>
              <h2 className="sh" style={{color:"#111"}}>{sec.t}</h2>
              <p className="sb" style={{color:"#555"}}>{sec.b}</p>
            </div>
          </div>
        ))}
      </section>

      <footer style={{background:G,padding:"64px 8vw 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:48,marginBottom:48}}>
            <div>
              <img src="/MTLVerde_Logo.png" alt="MTLVerde" style={{height:120,marginBottom:24,filter:"brightness(10)"}}/>
              <p style={{fontSize:13,color:"rgba(255,255,255,.45)",lineHeight:1.8,maxWidth:280}}>{dict.header.subtitle}</p>
            </div>
            <div>
              <h4 style={{fontSize:10,fontWeight:800,marginBottom:20,color:"rgba(255,255,255,.7)",letterSpacing:"2px",textTransform:"uppercase"}}>{lang==="en"?"Company":"Compagnie"}</h4>
              {(lang==="en"?[["About","#about"],["Press","#press"],["Careers","#careers"]]:[["À propos","#about"],["Presse","#press"],["Carrières","#careers"]]).map(([l,h])=><a key={l} href={"/"+lang+h} className="fl">{l}</a>)}
            </div>
            <div>
              <h4 style={{fontSize:10,fontWeight:800,marginBottom:20,color:"rgba(255,255,255,.7)",letterSpacing:"2px",textTransform:"uppercase"}}>Contact</h4>
              {[["Help / FAQ","#faq"],["Team","#team"],["mtlverde@gmail.com","mailto:mtlverde@gmail.com"]].map(([l,h])=><a key={l} href={h.startsWith("mailto")?h:"/"+lang+h} className="fl">{l}</a>)}
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:24,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <p style={{fontSize:11,color:"rgba(255,255,255,.25)"}}>© 2026 MTLVerde</p>
            <p style={{fontSize:11,color:"rgba(255,255,255,.25)"}}>mtlverde@gmail.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
