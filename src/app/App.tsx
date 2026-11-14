import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion, useScroll, useTransform, useSpring,
  useMotionValue, useInView, AnimatePresence,
} from "motion/react";
import Lenis from "lenis";
import { ArrowUpRight, Github, Linkedin, Mail, ExternalLink } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import alphinPhoto from "@/imports/Picture3.png";
import alphinCV from "@/imports/AlphinFrancis.pdf";
import alphinCVPage1 from "@/imports/AlphinFrancis-page-1.png";
import alphinCVPage2 from "@/imports/AlphinFrancis-page-2.png";

/* ─── CONSTANTS ──────────────────────────────────────────────────── */
const BG  = "'Bricolage Grotesque', sans-serif";
const MN  = "'DM Mono', monospace";
const BRD = "rgba(255,255,255,0.065)";
const LIGHT_BG = "#eeeae3";
const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
const SC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-./=∑∇∫ΩΔΠ";

function useLowPowerMode() {
  const [lowPower,setLowPower]=useState(false);
  useEffect(()=>{
    const nav=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean}};
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact=window.matchMedia("(max-width: 767px)").matches;
    const limited=(nav.deviceMemory??8)<=4||(nav.hardwareConcurrency??8)<=4||Boolean(nav.connection?.saveData);
    setLowPower(reduced||compact||limited);
  },[]);
  return lowPower;
}

/* ─── DATA ───────────────────────────────────────────────────────── */
const ROLES = ["Robotics & Automation Engineer", "Vision Systems Integrator", "Industrial Robot Programmer", "Simulation & Commissioning Engineer"];
const PROJECTS = [
  { num:"01", title:"Mobile Manipulator Cleaning Validation", short:"Cleaning Validation", type:"Mobile Manipulation · Pharmaceutical Lab", year:"ONGOING", spec:"Master Thesis", desc:"Automating pharmaceutical cleaning validation with a mobile manipulator and environment CAD data. Robotic motion, sensing, and test procedures are integrated into a reliable, repeatable workflow.", img:"photo-1485827404703-89b55fcc595e", tags:["Mobile Manipulator","Python","CAD","Validation"] },
  { num:"02", title:"Robotic Manipulator", short:"Robotic Manipulator", type:"Multi-axis Motion · Simulation", year:"ACADEMIC", spec:"MATLAB · ROS · Ubuntu", desc:"Programmed multi-axis robotic manipulator motion and validated robot behavior using MATLAB, ROS, RViz, and Gazebo on Ubuntu.", img:"photo-1518770660439-4636190af475", tags:["MATLAB","ROS1","RViz","Gazebo"] },
  { num:"03", title:"Mobile Robots", short:"Mobile Robots", type:"Navigation · Planning · SLAM", year:"ACADEMIC", spec:"ROS · MATLAB", desc:"Implemented obstacle avoidance, homing, path following, path planning, and SLAM for mobile robot platforms across ROS and MATLAB environments.", img:"photo-1563770660941-10051e90e70e", tags:["SLAM","Path Planning","ROS1","MATLAB"] },
  { num:"04", title:"Voice Assistant Chatbot", short:"Voice Assistant", type:"Conversational AI · Speech", year:"PROTOTYPE", spec:"Hugging Face Models", desc:"Built a voice assistant chatbot using Faster Whisper for speech recognition and Coqui XTTS for neural text-to-speech synthesis.", img:"photo-1555255707-c07966088b7b", tags:["Faster Whisper","Coqui XTTS","Hugging Face","Python"] },
  { num:"05", title:"Weight Regulation for Trucks", short:"Truck Load Regulation", type:"Embedded Mechatronics · Safety", year:"PROTOTYPE", spec:"Arduino · Sensors", desc:"Designed and built a prototype combining Arduino, a servo motor, and load-sensor technology to detect and regulate overloading for improved efficiency and road safety.", img:"photo-1519003722824-194d4455a60c", tags:["Arduino","Servo Motor","Load Sensor","Prototype"] },
];
const SKILLS_DOMAINS = [
  { label:"Robotics",    score:0.95, items:["Universal Robots","Stäubli · VAL3","URScript","UR RTDE","TX2-140"] },
  { label:"Vision",      score:0.90, items:["OpenCV","Open3D","RealSense","CubeEye","SensoPart"] },
  { label:"Simulation",  score:0.85, items:["ROS1 · Gazebo","RViz","RoboDK","VTK","Fusion 360 · Blender"] },
  { label:"Programming", score:0.88, items:["Python","C++","MATLAB","Linux","GitLab"] },
];
const TIMELINE = [
  { year:"10.25—NOW", role:"Robotics Engineer – Intern",   org:"Invite GmbH · Germany",      detail:"Developing repeatable mobile-manipulator workflows for cleaning validation with environment CAD data. Delivered RoX vision-guided powder dosing with QR identification and SensoPart integration; programmed Stäubli workspace logic in VAL3, validated concepts in Robotics Suite, prototyped parts in Fusion 360, and authored commissioning documentation." },
  { year:"10.24—10.25", role:"Working Student – Robotics",   org:"Fraunhofer IWU",   detail:"Integrated Intel RealSense and CubeEye perception hardware with OpenCV and Open3D across UR10 and UR20 platforms. Supported a robotic demo-cell through a full year of testing and troubleshooting, while building DH/MDH kinematic databases with VTK visualization." },
  { year:"10.22—01.27", role:"M.Sc. Automation & Robotics",  org:"TU Dortmund",      detail:"Focus: modelling and control of robotic manipulators, automated driving, networked mobile robotic systems, computer vision, mobile robotics, and machine learning in robotics. Master thesis centers on mobile-manipulator cleaning validation." },
  { year:"08.17—07.21", role:"B.Tech Mechatronics Engineering", org:"APJ Abdul Kalam Technological University", detail:"Thesis: Automatic Data Logging Using QR-code System. Focus modules included sensors and actuators, MEMS, robotics, digital manufacturing, and PLC systems." },
];
const AUTOMATION_PHASES = [
  { id:"SYS-01", title:"Perceive", meta:"CAMERAS · DEPTH · POINT CLOUDS", body:"Industrial cameras and depth sensors become calibrated, testable perception pipelines using OpenCV, Open3D, RealSense, CubeEye, and SensoPart." },
  { id:"SYS-02", title:"Plan & Simulate", meta:"KINEMATICS · COLLISION · FEASIBILITY", body:"Robot behavior is modelled before deployment through DH/MDH data, ROS, Gazebo, RViz, RoboDK, VTK, and Stäubli Robotics Suite." },
  { id:"SYS-03", title:"Deploy & Validate", meta:"TEST SCRIPTS · COMMISSIONING · HANDOVER", body:"Workflows move from simulation to reliable operation through workspace validation, troubleshooting, repeatability testing, and structured documentation." },
];

/* ─── GEAR ───────────────────────────────────────────────────────── */
function GearDecor({ size=200, teeth=16, speed=26, opacity=0.045, reverse=false, x=0, y=0, dark=true }:
  { size?:number; teeth?:number; speed?:number; opacity?:number; reverse?:boolean; x?:number|string; y?:number|string; dark?:boolean }) {
  const r=size/2, outer=r*0.88, inner=r*0.63, bore=r*0.18, hub=r*0.28;
  const stroke = dark ? "white" : "rgba(0,0,0,0.55)";
  let d="";
  for(let i=0;i<teeth;i++){
    const a1=((i+0.09)/teeth)*Math.PI*2, a2=((i+0.38)/teeth)*Math.PI*2;
    const a3=((i+0.62)/teeth)*Math.PI*2, a4=((i+0.91)/teeth)*Math.PI*2;
    const c=Math.cos,s=Math.sin;
    if(i===0) d+=`M ${r+inner*c(a1)} ${r+inner*s(a1)} `;
    d+=`L ${r+outer*c(a2)} ${r+outer*s(a2)} L ${r+outer*c(a3)} ${r+outer*s(a3)} L ${r+inner*c(a4)} ${r+inner*s(a4)} `;
  }
  d+="Z";
  const spk=(a:number)=>`M ${r+Math.cos(a)*bore} ${r+Math.sin(a)*bore} L ${r+Math.cos(a)*hub*2.2} ${r+Math.sin(a)*hub*2.2}`;
  return (
    <svg width={size} height={size} style={{position:"absolute",left:x,top:y,opacity,pointerEvents:"none"}}>
      <style>{`@keyframes gs{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <g style={{transformOrigin:`${r}px ${r}px`,animation:`gs ${speed}s linear infinite${reverse?" reverse":""}`}}>
        <path d={d} fill="none" stroke={stroke} strokeWidth="0.9"/>
        <circle cx={r} cy={r} r={inner*0.72} fill="none" stroke={stroke} strokeWidth="0.65"/>
        <circle cx={r} cy={r} r={hub} fill="none" stroke={stroke} strokeWidth="0.8"/>
        <circle cx={r} cy={r} r={bore} fill="none" stroke={stroke} strokeWidth="0.65"/>
        {[0,1,2,3,4,5].map(i=><path key={i} d={spk((i/6)*Math.PI*2)} stroke={stroke} strokeWidth="0.55" fill="none"/>)}
      </g>
    </svg>
  );
}

/* ─── TYPEBOT: robotic typewriter ────────────────────────────────── */
function TypeBot({ text, delay=0, speed=48, className="", style={}, cursor=true }:
  { text:string; delay?:number; speed?:number; className?:string; style?:React.CSSProperties; cursor?:boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once:true, margin:"-8% 0px" });
  const [chars, setChars] = useState<Array<{ch:string, locked:boolean}>>([]);
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(()=>{
    if(!inView) return;
    const tid = setTimeout(()=>{
      setActive(true);
      let idx=0;
      const type=()=>{
        if(idx>=text.length){ setDone(true); setTimeout(()=>setActive(false),900); return; }
        const target=text[idx];
        if(target===" "){ setChars(p=>[...p,{ch:" ",locked:true}]); idx++; setTimeout(type, speed*0.5); return; }
        // flash wrong char then lock in correct
        const wrong = SC[Math.floor(Math.random()*SC.length)];
        setChars(p=>[...p,{ch:wrong,locked:false}]);
        setTimeout(()=>{
          setChars(p=>{ const n=[...p]; n[idx]={ch:target,locked:true}; return n; });
          idx++;
          setTimeout(type, speed*(0.85+Math.random()*0.35));
        }, 62);
      };
      type();
    }, delay*1000);
    return ()=>clearTimeout(tid);
  },[inView,text,delay,speed]);

  return (
    <span ref={ref} className={className} style={style}>
      {chars.map((c,i)=>(
        <span key={i} style={{color:c.locked?"inherit":"rgba(255,255,255,0.3)"}}>{c.ch}</span>
      ))}
      {cursor&&active&&!done&&(
        <span style={{display:"inline-block",width:"2px",height:"0.82em",background:"currentColor",marginLeft:"2px",verticalAlign:"text-bottom",animation:"termBlink 0.55s step-end infinite"}}/>
      )}
    </span>
  );
}

/* ─── SCRAMBLE TEXT ──────────────────────────────────────────────── */
function ScrambleText({ text, delay=0, style={}, className="" }:
  { text:string; delay?:number; style?:React.CSSProperties; className?:string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once:true });
  const [disp, setDisp] = useState(text);
  useEffect(()=>{
    if(!inView) return;
    const tid = setTimeout(()=>{
      let frame=0;
      const total = 42 + text.length * 1.5;
      const id = setInterval(()=>{
        frame++;
        setDisp(text.split("").map((ch,i)=>{
          if(ch===" ") return " ";
          const resolve = Math.floor((i/text.length)*total*0.65)+10;
          if(frame>resolve) return ch;
          return SC[Math.floor(Math.random()*SC.length)];
        }).join(""));
        if(frame>=total) clearInterval(id);
      }, 36);
      return ()=>clearInterval(id);
    }, delay*1000);
    return ()=>clearTimeout(tid);
  },[inView,text,delay]);
  return <span ref={ref} className={className} style={style}>{disp}</span>;
}

/* ─── PARTICLE FIELD ─────────────────────────────────────────────── */
function ParticleField() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const ctx=el.getContext("2d"); if(!ctx) return;
    const resize=()=>{el.width=el.offsetWidth;el.height=el.offsetHeight;};
    resize(); window.addEventListener("resize",resize);
    const N=52;
    const pts=Array.from({length:N},()=>({x:Math.random()*el.width,y:Math.random()*el.height,vx:(Math.random()-0.5)*0.21,vy:(Math.random()-0.5)*0.21,r:Math.random()*1.1+0.35}));
    const packets:Array<{fi:number,ti:number,t:number,spd:number}>=[];
    let raf:number;
    const draw=()=>{
      const W=el.width,H=el.height;
      ctx.clearRect(0,0,W,H);
      for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;}
      for(let i=0;i<N;i++) for(let j=i+1;j<N;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<105){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(255,255,255,${(1-d/105)*0.05})`;ctx.lineWidth=0.5;ctx.stroke();}
      }
      for(const p of pts){ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.07)";ctx.fill();}
      if(Math.random()<0.01&&packets.length<5){
        const fi=Math.floor(Math.random()*N);
        for(let j=0;j<N;j++){if(j===fi) continue;const dx=pts[fi].x-pts[j].x,dy=pts[fi].y-pts[j].y;if(Math.sqrt(dx*dx+dy*dy)<105){packets.push({fi,ti:j,t:0,spd:0.016+Math.random()*0.01});break;}}
      }
      for(let i=packets.length-1;i>=0;i--){
        const pk=packets[i]; pk.t+=pk.spd;
        if(pk.t>=1){packets.splice(i,1);continue;}
        const px=pts[pk.fi].x+(pts[pk.ti].x-pts[pk.fi].x)*pk.t;
        const py=pts[pk.fi].y+(pts[pk.ti].y-pts[pk.fi].y)*pk.t;
        ctx.beginPath();ctx.arc(px,py,2,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.5)";ctx.fill();
      }
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none"/>;
}

/* ─── SCAN SWEEP ─────────────────────────────────────────────────── */
function ScanSweep() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:4}}>
      <motion.div className="absolute left-0 right-0"
        style={{height:1.5,background:"linear-gradient(to right,transparent 0%,rgba(255,255,255,0.04) 10%,rgba(255,255,255,0.16) 50%,rgba(255,255,255,0.04) 90%,transparent 100%)",boxShadow:"0 0 14px rgba(255,255,255,0.1)"}}
        animate={{top:["-2%","102%"]}} transition={{duration:7,repeat:Infinity,repeatDelay:13,ease:"linear"}}/>
      <motion.div className="absolute left-0 right-0"
        style={{height:64,background:"linear-gradient(to bottom,rgba(255,255,255,0.024) 0%,transparent 100%)"}}
        animate={{top:["-10%","94%"]}} transition={{duration:7,repeat:Infinity,repeatDelay:13,ease:"linear"}}/>
    </div>
  );
}

/* ─── DATA STREAM ────────────────────────────────────────────────── */
function DataStream() {
  const [rows,setRows]=useState<string[]>([]);
  useEffect(()=>{
    const gen=()=>{
      const r=Math.random();
      if(r<0.2) return "0x"+Math.floor(Math.random()*0xFFFF).toString(16).padStart(4,"0").toUpperCase();
      if(r<0.4) return (Math.random()*999.9).toFixed(2);
      if(r<0.6) return Math.floor(Math.random()*2).toString().repeat(8);
      return ["SYNC","IDLE","READ","EXEC","WAIT","LOAD","INIT","POLL","ACK","NACK","BUSY","DONE"][Math.floor(Math.random()*12)];
    };
    setRows(Array.from({length:26},gen));
    const id=setInterval(()=>setRows(r=>{const n=[...r];n[Math.floor(Math.random()*n.length)]=gen();return n;}),150);
    return()=>clearInterval(id);
  },[]);
  return (
    <div className="absolute right-4 top-20 bottom-14 hidden lg:flex flex-col justify-between pointer-events-none" style={{width:80,zIndex:5}}>
      <div style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.11)",letterSpacing:"0.15em",borderBottom:"1px solid rgba(255,255,255,0.05)",paddingBottom:4,marginBottom:3}}>SYS_DATA</div>
      {rows.map((d,i)=>(
        <div key={i} style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.07)",letterSpacing:"0.05em",textAlign:"right",animation:"dataFlicker 3s infinite",animationDelay:`${i*0.12}s`}}>{d}</div>
      ))}
      <div style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.08)",letterSpacing:"0.12em",borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:4,marginTop:3}}>RDY◆</div>
    </div>
  );
}

/* ─── HUD FRAME ──────────────────────────────────────────────────── */
/* ─── SECTION COUNTER ────────────────────────────────────────────── */
function SectionCounter() {
  const SECS=["home","work","about","skills","contact"];
  const [cur,setCur]=useState(0);
  useEffect(()=>{
    const fn=()=>{
      for(let i=SECS.length-1;i>=0;i--){
        const el=document.getElementById(SECS[i]);
        if(el&&el.getBoundingClientRect().top<=window.innerHeight*0.55){setCur(i);break;}
      }
    };
    window.addEventListener("scroll",fn,{passive:true});fn();
    return()=>window.removeEventListener("scroll",fn);
  },[]);
  return (
    <div className="hidden md:flex" style={{position:"fixed",right:20,top:"50%",transform:"translateY(-50%)",zIndex:30,
      flexDirection:"column",alignItems:"center",gap:14,pointerEvents:"none"}}>
      {/* Dots */}
      {SECS.map((_,i)=>(
        <motion.div key={i} animate={{height:i===cur?20:6,background:i===cur?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.14)"}}
          transition={{duration:0.35,ease:[0.22,1,0.36,1]}}
          style={{width:1.5,borderRadius:2}}/>
      ))}
      {/* Counter text — rotated */}
      <div style={{transform:"rotate(90deg)",marginTop:12,whiteSpace:"nowrap",
        fontFamily:"'DM Mono', monospace",fontSize:"9px",letterSpacing:"0.28em",
        color:"rgba(255,255,255,0.2)"}}>
        {String(cur+1).padStart(2,"0")} / {String(SECS.length).padStart(2,"0")}
      </div>
    </div>
  );
}

/* ─── ROBOTIC TRANSITION ─────────────────────────────────────────── */
function RoboticTransition({onDone,tone,label}:{onDone:()=>void;tone:"black"|"white";label:string}) {
  const COLS=14,ROWS=8;
  const CHARS="01⬡⬢◈▣◉░▒▓";
  const [cells,setCells]=useState<number[]>(Array(COLS*ROWS).fill(0));
  const cover=tone==="black"?"#080808":"#f2f0ea";
  const ink=tone==="black"?"255,255,255":"8,8,8";
  useEffect(()=>{
    const cx=COLS/2,cy=ROWS/2;
    const order=[...Array(COLS*ROWS).keys()].sort((a,b)=>{
      const ax=a%COLS,ay=Math.floor(a/COLS);
      const bx=b%COLS,by=Math.floor(b/COLS);
      return Math.hypot(ax-cx,ay-cy)-Math.hypot(bx-cx,by-cy);
    });
    let i=0;
    const id=setInterval(()=>{
      if(i>=order.length){clearInterval(id);setTimeout(onDone,90);return;}
      setCells(p=>{
        const n=[...p];
        for(let batch=0;batch<6&&i<order.length;batch++,i++)n[order[i]]=1;
        return n;
      });
    },14);
    return()=>clearInterval(id);
  },[onDone]);
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.12}}
      style={{position:"fixed",inset:0,zIndex:9999,display:"grid",
        gridTemplateColumns:`repeat(${COLS},1fr)`,gridTemplateRows:`repeat(${ROWS},1fr)`}}>
      {cells.map((on,i)=>(
        <motion.div key={i} animate={{background:on?cover:"rgba(0,0,0,0)"}}
          transition={{duration:0.1}}
          style={{display:"flex",alignItems:"center",justifyContent:"center",
            border:on?`1px solid rgba(${ink},0.055)`:"1px solid transparent",
            fontFamily:"'DM Mono',monospace",fontSize:"9px",
            color:`rgba(${ink},0.2)`,lineHeight:1}}>
          {on?CHARS[Math.floor(Math.random()*CHARS.length)]:""}
        </motion.div>
      ))}
      <motion.div initial={{opacity:0,scaleX:0.8}} animate={{opacity:[0,1,1,0],scaleX:[0.8,1,1,1.08]}} transition={{duration:0.42,times:[0,0.3,0.74,1]}}
        style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",color:`rgb(${ink})`,textAlign:"center",pointerEvents:"none",whiteSpace:"nowrap"}}>
        <div style={{fontFamily:MN,fontSize:"9px",letterSpacing:"0.38em",opacity:0.58}}>ROUTE EXECUTION</div>
        <div style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(2rem,6vw,5.5rem)",letterSpacing:"-0.05em",lineHeight:0.9,marginTop:10}}>{label.toUpperCase()}</div>
        <motion.div initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration:0.28}} style={{height:1,background:`rgba(${ink},0.5)`,marginTop:16,transformOrigin:"left"}}/>
      </motion.div>
      <motion.div initial={{scaleY:0}} animate={{scaleY:1}} transition={{duration:0.3}} style={{position:"absolute",left:"4vw",top:"8vh",bottom:"8vh",width:1,background:`rgba(${ink},0.28)`,transformOrigin:"top"}}/>
      <motion.div initial={{scaleY:0}} animate={{scaleY:1}} transition={{duration:0.3,delay:0.04}} style={{position:"absolute",right:"4vw",top:"8vh",bottom:"8vh",width:1,background:`rgba(${ink},0.28)`,transformOrigin:"bottom"}}/>
    </motion.div>
  );
}

/* ─── WORK MINI CANVAS ───────────────────────────────────────────── */
function WorkMiniCanvas({type}:{type:number}) {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    const W=canvas.width,H=canvas.height;
    let raf:number,T=0;
    const draw=()=>{
      ctx.clearRect(0,0,W,H);T+=0.015;
      if(type===0){
        // Exoskeleton — 3-joint arm
        const base={x:W*0.5,y:H*0.78};
        const a1=Math.sin(T*0.7)*0.5+1.0,a12=a1+Math.sin(T*1.2+1)*0.6,a123=a12+Math.sin(T*0.9+2)*0.4;
        const j2={x:base.x+Math.cos(a1)*48,y:base.y-Math.sin(a1)*48};
        const j3={x:j2.x+Math.cos(a12)*38,y:j2.y-Math.sin(a12)*38};
        const ee={x:j3.x+Math.cos(a123)*24,y:j3.y-Math.sin(a123)*24};
        ctx.strokeStyle="rgba(255,255,255,0.55)";ctx.lineWidth=2;ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.lineTo(j2.x,j2.y);ctx.lineTo(j3.x,j3.y);ctx.lineTo(ee.x,ee.y);ctx.stroke();
        [base,j2,j3].forEach((p,i)=>{
          const r=[7,6,5][i];
          ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);
          ctx.strokeStyle="rgba(255,255,255,0.7)";ctx.lineWidth=1.4;ctx.stroke();
          ctx.beginPath();ctx.arc(p.x,p.y,2.2,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.8)";ctx.fill();
        });
        // Workspace arc
        ctx.setLineDash([3,6]);ctx.strokeStyle="rgba(255,255,255,0.12)";ctx.lineWidth=0.8;
        ctx.beginPath();ctx.arc(base.x,base.y,100,Math.PI*1.8,Math.PI*0.1);ctx.stroke();ctx.setLineDash([]);
        // Crosshair at EE
        const ch=8;ctx.strokeStyle="rgba(255,255,255,0.35)";ctx.lineWidth=0.8;
        ctx.beginPath();ctx.moveTo(ee.x-ch,ee.y);ctx.lineTo(ee.x-3,ee.y);ctx.moveTo(ee.x+3,ee.y);ctx.lineTo(ee.x+ch,ee.y);
        ctx.moveTo(ee.x,ee.y-ch);ctx.lineTo(ee.x,ee.y-3);ctx.moveTo(ee.x,ee.y+3);ctx.lineTo(ee.x,ee.y+ch);ctx.stroke();
      } else if(type===1){
        // Mobile robot — radar sweep
        const cx=W/2,cy=H/2,maxR=Math.min(W,H)*0.44;
        // Grid rings
        [0.33,0.66,1].forEach(f=>{
          ctx.beginPath();ctx.arc(cx,cy,maxR*f,0,Math.PI*2);
          ctx.strokeStyle=`rgba(255,255,255,${0.06+f*0.04})`;ctx.lineWidth=0.6;ctx.stroke();
        });
        // Cross
        ctx.strokeStyle="rgba(255,255,255,0.06)";ctx.lineWidth=0.5;
        ctx.beginPath();ctx.moveTo(cx-maxR,cy);ctx.lineTo(cx+maxR,cy);ctx.moveTo(cx,cy-maxR);ctx.lineTo(cx,cy+maxR);ctx.stroke();
        // Sweep
        const sweep=T*2;
        const grad=ctx.createConicalGradient?ctx.createConicalGradient(cx,cy,sweep):null;
        ctx.save();ctx.translate(cx,cy);ctx.rotate(sweep);
        const g=ctx.createLinearGradient(0,-maxR,0,0);
        g.addColorStop(0,"rgba(255,255,255,0)");g.addColorStop(0.4,"rgba(255,255,255,0.0)");
        g.addColorStop(1,"rgba(255,255,255,0.18)");
        ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,maxR,-Math.PI*0.4,0);ctx.closePath();ctx.fill();
        ctx.restore();
        // Blips
        const blips=[{r:0.45,a:0.8},{r:0.72,a:2.1},{r:0.28,a:4.5},{r:0.6,a:3.8}];
        blips.forEach(b=>{
          const age=((sweep-b.a)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
          if(age<Math.PI*0.7){
            const alpha=(1-age/(Math.PI*0.7))*0.85;
            const px=cx+Math.cos(b.a)*maxR*b.r,py=cy+Math.sin(b.a)*maxR*b.r;
            ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,255,255,${alpha})`;ctx.fill();
          }
        });
        // Center dot
        ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.7)";ctx.fill();
      } else if(type===2){
        // Perception system — hex pulse rings
        const cx=W/2,cy=H/2;
        for(let r=0;r<3;r++){
          const phase=((T*0.8)+r*0.35)%1;
          const rad=20+phase*70;const alpha=(1-phase)*0.5;
          ctx.beginPath();
          for(let s=0;s<6;s++){
            const a=(s/6)*Math.PI*2-Math.PI/6;
            const x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad;
            s===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
          }
          ctx.closePath();ctx.strokeStyle=`rgba(255,255,255,${alpha})`;ctx.lineWidth=1;ctx.stroke();
        }
        // Circuit nodes
        const nodes=[{x:0.2,y:0.25},{x:0.75,y:0.3},{x:0.15,y:0.7},{x:0.8,y:0.72},{x:0.5,y:0.5}];
        nodes.forEach((n,i)=>{
          const px=n.x*W,py=n.y*H;const pulse=Math.sin(T*2+i*1.2)*0.5+0.5;
          ctx.beginPath();ctx.arc(px,py,3+pulse*2,0,Math.PI*2);
          ctx.strokeStyle=`rgba(255,255,255,${0.2+pulse*0.3})`;ctx.lineWidth=1;ctx.stroke();
          ctx.beginPath();ctx.arc(px,py,1.5,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.6)";ctx.fill();
        });
        // Connecting traces
        [[0,4],[1,4],[2,4],[3,4]].forEach(([a,b])=>{
          const pa=nodes[a],pb=nodes[b];
          const flow=(T*1.5)%1;
          const gx=ctx.createLinearGradient(pa.x*W,pa.y*H,pb.x*W,pb.y*H);
          gx.addColorStop(Math.max(0,flow-0.25),"rgba(255,255,255,0)");
          gx.addColorStop(flow,"rgba(255,255,255,0.35)");
          gx.addColorStop(Math.min(1,flow+0.25),"rgba(255,255,255,0)");
          ctx.beginPath();ctx.moveTo(pa.x*W,pa.y*H);ctx.lineTo(pb.x*W,pb.y*H);
          ctx.strokeStyle=gx;ctx.lineWidth=1;ctx.stroke();
        });
      } else if(type===3) {
        // Voice assistant — neural signal network
        const layers=[[0.15],[0.35,0.58],[0.55,0.35,0.72],[0.75,0.5,0.62,0.38]];
        const xs=[0.18,0.38,0.62,0.82];
        const nodes:Array<{x:number,y:number,l:number,i:number}>=[];
        layers.forEach((ys,li)=>ys.forEach((y,ni)=>nodes.push({x:xs[li]*W,y:y*H,l:li,i:ni})));
        // Connections
        layers.forEach((ys,li)=>{
          if(li===layers.length-1)return;
          ys.forEach((_,ni)=>{
            layers[li+1].forEach((_,nj)=>{
              const from=nodes.find(n=>n.l===li&&n.i===ni)!;
              const to=nodes.find(n=>n.l===li+1&&n.i===nj)!;
              const pulse=((T*0.8+li*0.4+ni*0.2+nj*0.15)%1);
              const alpha=(Math.sin(T+li+ni*0.7))*0.5+0.5;
              ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);
              ctx.strokeStyle=`rgba(255,255,255,${alpha*0.12})`;ctx.lineWidth=0.7;ctx.stroke();
              // Pulse bead
              const bx=from.x+(to.x-from.x)*pulse,by=from.y+(to.y-from.y)*pulse;
              ctx.beginPath();ctx.arc(bx,by,1.5,0,Math.PI*2);
              ctx.fillStyle=`rgba(255,255,255,${alpha*0.45})`;ctx.fill();
            });
          });
        });
        // Nodes
        nodes.forEach(n=>{
          const pulse=Math.sin(T*1.5+n.l*0.8+n.i*0.5)*0.5+0.5;
          ctx.beginPath();ctx.arc(n.x,n.y,5+pulse*2,0,Math.PI*2);
          ctx.strokeStyle=`rgba(255,255,255,${0.3+pulse*0.4})`;ctx.lineWidth=1.2;ctx.stroke();
          ctx.beginPath();ctx.arc(n.x,n.y,2,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.7)";ctx.fill();
        });
      } else {
        // Load regulation — live weight gauge
        const cx=W/2,cy=H*0.62,r=54;
        const load=0.68+Math.sin(T*1.2)*0.17;
        ctx.lineWidth=8;ctx.lineCap="round";
        ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*0.85,Math.PI*2.15);
        ctx.strokeStyle="rgba(255,255,255,0.08)";ctx.stroke();
        ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*0.85,Math.PI*(0.85+1.3*load));
        ctx.strokeStyle="rgba(255,255,255,0.55)";ctx.stroke();
        for(let i=0;i<=12;i++){
          const a=Math.PI*(0.85+(i/12)*1.3);
          ctx.beginPath();
          ctx.moveTo(cx+Math.cos(a)*(r-12),cy+Math.sin(a)*(r-12));
          ctx.lineTo(cx+Math.cos(a)*(r-5),cy+Math.sin(a)*(r-5));
          ctx.strokeStyle="rgba(255,255,255,0.24)";ctx.lineWidth=0.8;ctx.stroke();
        }
        const needle=Math.PI*(0.85+1.3*load);
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(needle)*(r-15),cy+Math.sin(needle)*(r-15));
        ctx.strokeStyle="rgba(255,255,255,0.75)";ctx.lineWidth=1.5;ctx.stroke();
        ctx.beginPath();ctx.arc(cx,cy,4,0,Math.PI*2);ctx.fillStyle="white";ctx.fill();
        ctx.font="8px 'DM Mono',monospace";ctx.textAlign="center";
        ctx.fillStyle="rgba(255,255,255,0.5)";ctx.fillText(`${Math.round(load*100)}% LOAD`,cx,cy+27);
      }
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  },[type]);
  return (
    <canvas ref={ref} width={200} height={140} className="hidden md:block"
      style={{position:"absolute",top:16,right:16,width:200,height:140,
        opacity:0.55,mixBlendMode:"screen",pointerEvents:"none"}}/>
  );
}

function GlobalScanLine() {
  return (
    <motion.div style={{position:"fixed",left:0,right:0,height:2,pointerEvents:"none",zIndex:9998,
      background:"linear-gradient(to bottom,transparent,rgba(255,255,255,0.045) 50%,transparent)"}}
      animate={{top:["-1%","101%"]}} transition={{duration:8,repeat:Infinity,repeatDelay:10,ease:"linear"}}/>
  );
}
function HUDCorners({lCol="rgba(255,255,255,0.35)",size=14}:{lCol?:string;size?:number}) {
  const s={position:"absolute" as const,width:size,height:size,pointerEvents:"none" as const};
  const b=`1px solid ${lCol}`;
  return (
    <>
      <div style={{...s,top:0,left:0,borderTop:b,borderLeft:b}}/>
      <div style={{...s,top:0,right:0,borderTop:b,borderRight:b}}/>
      <div style={{...s,bottom:0,left:0,borderBottom:b,borderLeft:b}}/>
      <div style={{...s,bottom:0,right:0,borderBottom:b,borderRight:b}}/>
    </>
  );
}
function HUDFrame({dark=true}:{label?:string;sublabel?:string;dark?:boolean}) {
  const col=dark?"rgba(255,255,255,0.28)":"rgba(0,0,0,0.28)";
  const L=18,S=18;
  const corner=(sx:number,sy:number)=>{
    const x=sx>0?`right-3`:`left-3`, y=sy>0?`bottom-3`:`top-3`;
    return (
      <div className={`absolute ${x} ${y} pointer-events-none`}>
        <svg width={L+S} height={L+S} viewBox={`0 0 ${L+S} ${L+S}`} fill="none"
          style={{transform:`scale(${sx},${sy})`,transformOrigin:"50% 50%"}}>
          <path d={`M ${S} 0 L 0 0 L 0 ${S}`} stroke={col} strokeWidth="1"/>
          <path d={`M ${L} ${S+L} L ${L+S} ${S+L} L ${L+S} ${L}`} stroke={col} strokeWidth="1" opacity="0.4"/>
        </svg>
      </div>
    );
  };
  return (
    <>
      {corner(1,1)} {corner(-1,1)} {corner(1,-1)} {corner(-1,-1)}
    </>
  );
}

/* ─── ENHANCED 3D ROBOT ARM CANVAS ──────────────────────────────── */
function RobotArmCanvas({lowPower=false}:{lowPower?:boolean}) {
  const cvs=useRef<HTMLCanvasElement>(null);
  const trace=useRef<Array<[number,number]>>([]);
  const hitCloud=useRef<Array<{x:number,y:number,a:number}>>([]);
  const tick=useRef(0);
  const raf=useRef(0);

  useEffect(()=>{
    const el=cvs.current; if(!el) return;
    const ctx=el.getContext("2d"); if(!ctx) return;
    const resize=()=>{el.width=el.offsetWidth;el.height=el.offsetHeight;};
    resize(); window.addEventListener("resize",resize);
    const {cos,sin,atan2,sqrt,PI,abs,floor,random}=Math;

    const drawLink3D=(ax:number,ay:number,bx:number,by:number,hw:number)=>{
      const ang=atan2(by-ay,bx-ax),perp=ang+PI/2;
      const co=cos(perp),si=sin(perp);
      const A=[ax+co*hw,ay+si*hw],B=[bx+co*hw*0.66,by+si*hw*0.66];
      const C=[bx-co*hw*0.66,by-si*hw*0.66],D=[ax-co*hw,ay-si*hw];
      const grad=ctx.createLinearGradient(A[0],A[1],D[0],D[1]);
      grad.addColorStop(0,"rgba(255,255,255,0.19)");
      grad.addColorStop(0.5,"rgba(255,255,255,0.07)");
      grad.addColorStop(1,"rgba(255,255,255,0.01)");
      ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.lineTo(C[0],C[1]);ctx.lineTo(D[0],D[1]);ctx.closePath();
      ctx.fillStyle=grad;ctx.fill();
      ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);
      ctx.strokeStyle="rgba(255,255,255,0.6)";ctx.lineWidth=1.3;ctx.stroke();
      ctx.beginPath();ctx.moveTo(D[0],D[1]);ctx.lineTo(C[0],C[1]);
      ctx.strokeStyle="rgba(255,255,255,0.09)";ctx.lineWidth=0.7;ctx.stroke();
      ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(D[0],D[1]);ctx.moveTo(B[0],B[1]);ctx.lineTo(C[0],C[1]);
      ctx.strokeStyle="rgba(255,255,255,0.22)";ctx.lineWidth=0.8;ctx.stroke();
      ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);
      ctx.strokeStyle="rgba(255,255,255,0.07)";ctx.lineWidth=0.5;ctx.setLineDash([3,5]);ctx.stroke();ctx.setLineDash([]);
      const len=sqrt((bx-ax)**2+(by-ay)**2),dx=(bx-ax)/len,dy=(by-ay)/len;
      for(let d=hw*2;d<len-hw;d+=20){
        const px=ax+dx*d,py=ay+dy*d;
        ctx.beginPath();ctx.moveTo(px+co*hw*0.54,py+si*hw*0.54);ctx.lineTo(px-co*hw*0.54,py-si*hw*0.54);
        ctx.strokeStyle="rgba(255,255,255,0.05)";ctx.lineWidth=0.5;ctx.stroke();
      }
    };

    const drawJoint3D=(jx:number,jy:number,r:number,label:string,deg:number)=>{
      // Glow
      ctx.save();ctx.shadowColor="rgba(255,255,255,0.4)";ctx.shadowBlur=10;
      ctx.beginPath();ctx.arc(jx,jy,r+1,0,PI*2);ctx.strokeStyle="rgba(255,255,255,0.55)";ctx.lineWidth=0.9;ctx.stroke();
      ctx.restore();
      // Sphere gradient
      const sg=ctx.createRadialGradient(jx-r*0.3,jy-r*0.3,r*0.04,jx,jy,r);
      sg.addColorStop(0,"rgba(255,255,255,0.28)");sg.addColorStop(0.5,"rgba(255,255,255,0.08)");sg.addColorStop(1,"rgba(255,255,255,0.01)");
      ctx.beginPath();ctx.arc(jx,jy,r,0,PI*2);ctx.fillStyle=sg;ctx.fill();
      ctx.beginPath();ctx.arc(jx,jy,r,0,PI*2);ctx.strokeStyle="rgba(255,255,255,0.5)";ctx.lineWidth=1.2;ctx.stroke();
      ctx.beginPath();ctx.arc(jx,jy,r*0.42,0,PI*2);ctx.strokeStyle="rgba(255,255,255,0.4)";ctx.lineWidth=0.8;ctx.stroke();
      for(let i=0;i<4;i++){const a=(i/4)*PI*2+PI/4;ctx.beginPath();ctx.arc(jx+cos(a)*r*0.65,jy+sin(a)*r*0.65,r*0.11,0,PI*2);ctx.strokeStyle="rgba(255,255,255,0.28)";ctx.lineWidth=0.6;ctx.stroke();}
      // TypeBot-style label
      ctx.fillStyle="rgba(255,255,255,0.22)";ctx.font=`7px '${MN.replace(/'/g,"")}',monospace`;
      ctx.fillText(label,jx+r+8,jy-4);
      ctx.fillStyle="rgba(255,255,255,0.42)";ctx.font=`7.5px '${MN.replace(/'/g,"")}',monospace`;
      ctx.fillText(`${deg.toFixed(1)}°`,jx+r+8,jy+7);
    };

    const drawArc=(jx:number,jy:number,ang:number,r:number)=>{
      ctx.beginPath();ctx.arc(jx,jy,r+14,-ang-0.7,-ang+0.7);ctx.strokeStyle="rgba(255,255,255,0.52)";ctx.lineWidth=1.4;ctx.stroke();
      for(let a=-0.65;a<=0.65;a+=0.16){
        const ra=-ang+a,ri=r+11,ro=r+16+(abs(a)<0.05?4:0);
        ctx.beginPath();ctx.moveTo(jx+cos(ra)*ri,jy+sin(ra)*ri);ctx.lineTo(jx+cos(ra)*ro,jy+sin(ra)*ro);
        ctx.strokeStyle=`rgba(255,255,255,${abs(a)<0.05?0.5:0.16})`;ctx.lineWidth=0.7;ctx.stroke();
      }
    };

    let lastFrame=0;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw=(stamp=0)=>{
      if(lowPower&&stamp-lastFrame<34){raf.current=requestAnimationFrame(draw);return;}
      lastFrame=stamp;
      const W=el.width,H=el.height;
      ctx.clearRect(0,0,W,H);
      const tv=tick.current;

      // Engineering grid
      for(let x=0;x<W;x+=44){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.strokeStyle=x%220===0?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.015)";ctx.lineWidth=0.5;ctx.stroke();}
      for(let y=0;y<H;y+=44){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.strokeStyle=y%220===0?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.015)";ctx.lineWidth=0.5;ctx.stroke();}
      ctx.fillStyle="rgba(255,255,255,0.04)";ctx.font=`6px monospace`;
      for(let x=220;x<W;x+=220) for(let y=220;y<H;y+=220) ctx.fillText(`${x},${y}`,x+3,y-2);

      // Slow ambient forward kinematics.
      const bx=W*0.56,by=H*0.72;
      const L1=H*0.24,L2=H*0.18,L3=H*0.11;
      const th1=0.52+sin(tv*0.28)*0.42;
      const th2=0.92+sin(tv*0.21+1.3)*0.55;
      const th3=-0.26+sin(tv*0.15+2.7)*0.60;
      const d1=((th1*180/PI)%360+360)%360;
      const d2=((th2*180/PI)%360+360)%360;
      const d3=((th3*180/PI)%360+360)%360;
      const j1x=bx,j1y=by;
      const j2x=j1x+cos(th1)*L1,j2y=j1y-sin(th1)*L1;
      const j3x=j2x+cos(th1+th2)*L2,j3y=j2y-sin(th1+th2)*L2;
      const eex=j3x+cos(th1+th2+th3)*L3,eey=j3y-sin(th1+th2+th3)*L3;

      // ─ LIDAR visualization (before arm so arm overlaps)
      const lidarN=24,lidarR=Math.min(W,H)*0.3;
      const lidarBase=tv*0.15;
      for(let i=0;i<lidarN;i++){
        const angle=lidarBase+(i/lidarN)*PI*2;
        const hitDist=lidarR*(0.3+0.56*abs(sin(angle*1.8+tv*0.07)));
        const hx=eex+cos(angle)*hitDist,hy=eey+sin(angle)*hitDist;
        // Fading ray
        const rg=ctx.createLinearGradient(eex,eey,eex+cos(angle)*lidarR,eey+sin(angle)*lidarR);
        rg.addColorStop(0,"rgba(255,255,255,0.07)");rg.addColorStop(0.6,"rgba(255,255,255,0.012)");rg.addColorStop(1,"rgba(255,255,255,0)");
        ctx.beginPath();ctx.moveTo(eex,eey);ctx.lineTo(eex+cos(angle)*lidarR,eey+sin(angle)*lidarR);
        ctx.strokeStyle=rg;ctx.lineWidth=0.4;ctx.stroke();
        // Hit dot
        ctx.beginPath();ctx.arc(hx,hy,1.2,0,PI*2);ctx.fillStyle=`rgba(255,255,255,${0.12+0.07*sin(tv*1.1+i)})`;ctx.fill();
        // Accumulate point cloud
        if(tv%0.4<0.013) hitCloud.current.push({x:hx,y:hy,a:0.18});
      }
      // Trim cloud
      if(hitCloud.current.length>180) hitCloud.current.splice(0,hitCloud.current.length-180);
      for(const p of hitCloud.current){p.a-=0.0006;if(p.a>0){ctx.beginPath();ctx.arc(p.x,p.y,0.8,0,PI*2);ctx.fillStyle=`rgba(255,255,255,${p.a})`;ctx.fill();}}

      // Active sweep beam
      const beamA=tv*0.9;
      const bg2=ctx.createLinearGradient(eex,eey,eex+cos(beamA)*lidarR*0.88,eey+sin(beamA)*lidarR*0.88);
      bg2.addColorStop(0,"rgba(255,255,255,0.22)");bg2.addColorStop(1,"rgba(255,255,255,0)");
      ctx.beginPath();ctx.moveTo(eex,eey);ctx.lineTo(eex+cos(beamA)*lidarR*0.88,eey+sin(beamA)*lidarR*0.88);
      ctx.strokeStyle=bg2;ctx.lineWidth=0.9;ctx.stroke();

      // Workspace envelopes
      ctx.setLineDash([5,11]);
      ctx.beginPath();ctx.arc(bx,by,(L1+L2+L3)*0.96,-PI*0.9,PI*0.06);ctx.strokeStyle="rgba(255,255,255,0.038)";ctx.lineWidth=0.8;ctx.stroke();
      ctx.setLineDash([]);

      // Subtle end-effector trace.
      trace.current.push([eex,eey]);
      if(trace.current.length>180) trace.current.shift();
      for(let i=1;i<trace.current.length;i++){
        const [ax,ay]=trace.current[i-1],[bxp,byp]=trace.current[i];
        ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bxp,byp);
        ctx.strokeStyle=`rgba(255,255,255,${(i/trace.current.length)*0.065})`;ctx.lineWidth=0.8;ctx.stroke();
      }

      // 3D Links
      drawLink3D(j1x,j1y,j2x,j2y,13.5);
      drawLink3D(j2x,j2y,j3x,j3y,10);
      drawLink3D(j3x,j3y,eex,eey,6.5);

      // Base platform
      ctx.strokeStyle="rgba(255,255,255,0.22)";ctx.lineWidth=1.1;
      ctx.beginPath();ctx.moveTo(bx-54,by+9);ctx.lineTo(bx+54,by+9);ctx.lineTo(bx+46,by+24);ctx.lineTo(bx-46,by+24);ctx.closePath();ctx.stroke();
      [bx-38,bx+38].forEach(hx=>{
        const sg2=ctx.createRadialGradient(hx-2,by+13,0,hx,by+17,6);
        sg2.addColorStop(0,"rgba(255,255,255,0.12)");sg2.addColorStop(1,"rgba(255,255,255,0)");
        ctx.beginPath();ctx.arc(hx,by+17,6,0,PI*2);ctx.fillStyle=sg2;ctx.fill();
        ctx.beginPath();ctx.arc(hx,by+17,6,0,PI*2);ctx.strokeStyle="rgba(255,255,255,0.2)";ctx.lineWidth=0.8;ctx.stroke();
        ctx.beginPath();ctx.arc(hx,by+17,1.8,0,PI*2);ctx.fillStyle="rgba(255,255,255,0.25)";ctx.fill();
      });
      ctx.beginPath();ctx.moveTo(bx-9,by);ctx.lineTo(bx-9,by+9);ctx.moveTo(bx+9,by);ctx.lineTo(bx+9,by+9);ctx.strokeStyle="rgba(255,255,255,0.18)";ctx.lineWidth=1;ctx.stroke();

      // Rotation arcs
      drawArc(j1x,j1y,th1,14);
      drawArc(j2x,j2y,th1+th2,11);
      drawArc(j3x,j3y,th1+th2+th3,8.5);

      // 3D Joints
      drawJoint3D(j1x,j1y,14,"J1",d1);
      drawJoint3D(j2x,j2y,11,"J2",d2);
      drawJoint3D(j3x,j3y,8.5,"J3",d3);

      // ─ Electric arcs at J1 (when arm angular velocity is high)
      const angV=abs(cos(tv*0.28)*0.12);
      if(angV>0.09&&random()<0.5){
        [[j1x,j1y,14],[j2x,j2y,11]].forEach(([jx,jy,r])=>{
          for(let a=0;a<floor(random()*3)+1;a++){
            const sa=random()*PI*2;
            ctx.beginPath();ctx.moveTo(jx+cos(sa)*r,jy+sin(sa)*r);
            let cx=jx+cos(sa)*r,cy=jy+sin(sa)*r;
            for(let s=0;s<5;s++){cx+=(random()-0.5)*13;cy+=(random()-0.5)*13;ctx.lineTo(cx,cy);}
            ctx.strokeStyle=`rgba(200,230,255,${0.1+random()*0.12})`;ctx.lineWidth=0.6;ctx.stroke();
          }
        });
      }

      // Gripper
      const eeAng=th1+th2+th3,perp=eeAng+PI/2;
      const gOpen=7+sin(tv*0.42)*4.5,gLen=26;
      [[1],[-1]].forEach(([sign])=>{
        ctx.beginPath();
        ctx.moveTo(eex+cos(perp)*gOpen*sign,eey+sin(perp)*gOpen*sign);
        ctx.lineTo(eex+cos(eeAng)*gLen+cos(perp)*gOpen*0.85*sign,eey+sin(eeAng)*gLen+sin(perp)*gOpen*0.85*sign);
        ctx.lineTo(eex+cos(eeAng)*gLen+cos(perp)*gOpen*0.4*sign,eey+sin(eeAng)*gLen+sin(perp)*gOpen*0.4*sign);
        ctx.strokeStyle="rgba(255,255,255,0.32)";ctx.lineWidth=1.2;ctx.stroke();
      });

      // ─ Target lock box on TCP
      const lS=22;
      ctx.save();ctx.translate(eex,eey);ctx.rotate(tv*0.55);
      ctx.beginPath();ctx.rect(-lS,-lS,lS*2,lS*2);
      ctx.strokeStyle=`rgba(255,255,255,${0.15+0.07*sin(tv*4)})`;ctx.lineWidth=0.7;ctx.setLineDash([3,9]);ctx.stroke();ctx.setLineDash([]);
      ctx.restore();
      const bSt=7,bLt=10;
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sy])=>{
        const cx=eex+sx*(lS*0.82),cy=eey+sy*(lS*0.82);
        ctx.beginPath();ctx.moveTo(cx+sx*bLt,cy);ctx.lineTo(cx,cy);ctx.lineTo(cx,cy+sy*bLt);
        ctx.strokeStyle="rgba(255,255,255,0.62)";ctx.lineWidth=1.2;ctx.stroke();
      });
      // Crosshair
      const td=11;
      ctx.beginPath();ctx.moveTo(eex-td,eey);ctx.lineTo(eex+td,eey);ctx.moveTo(eex,eey-td);ctx.lineTo(eex,eey+td);
      ctx.strokeStyle="rgba(255,255,255,0.45)";ctx.lineWidth=0.9;ctx.stroke();
      ctx.beginPath();ctx.arc(eex,eey,5,0,PI*2);ctx.stroke();
      // LOCKED label (pulsing)
      ctx.fillStyle=`rgba(255,255,255,${0.28+0.12*sin(tv*5)})`;ctx.font=`7px 'DM Mono',monospace`;ctx.fillText("LOCKED",eex-16,eey-lS-8);
      // Velocity readout
      const velMag=(0.18+sin(tv*0.28)*0.06).toFixed(2);
      ctx.fillStyle="rgba(255,255,255,0.2)";ctx.font=`7px 'DM Mono',monospace`;ctx.fillText(`v=${velMag} m/s`,eex+16,eey+18);

      // Coordinate axes
      ctx.lineWidth=1.1;
      ctx.strokeStyle="rgba(248,113,113,0.5)";ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+46,by);ctx.stroke();
      ctx.fillStyle="rgba(248,113,113,0.5)";ctx.font=`7.5px 'DM Mono',monospace`;ctx.fillText("X+",bx+49,by+3);
      ctx.strokeStyle="rgba(96,165,250,0.5)";ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by-46);ctx.stroke();
      ctx.fillStyle="rgba(96,165,250,0.5)";ctx.fillText("Z+",bx+4,by-49);

      // Dimension annotation
      ctx.setLineDash([2,5]);ctx.strokeStyle="rgba(255,255,255,0.09)";ctx.lineWidth=0.6;
      const midX=(j1x+j2x)/2-22,midY=(j1y+j2y)/2;
      ctx.beginPath();ctx.moveTo(j1x-18,j1y);ctx.lineTo(midX,midY);ctx.stroke();
      ctx.beginPath();ctx.moveTo(j2x-18,j2y);ctx.lineTo(midX,midY);ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle="rgba(255,255,255,0.13)";ctx.font=`7px 'DM Mono',monospace`;ctx.fillText("L1=450mm",midX-38,midY+1);

      // Mini joint state panel (bottom-right of canvas)
      const px=W-110,py=H-115;
      ctx.fillStyle="rgba(255,255,255,0.03)";ctx.fillRect(px-4,py-12,108,100);
      ctx.strokeStyle="rgba(255,255,255,0.07)";ctx.lineWidth=0.7;ctx.strokeRect(px-4,py-12,108,100);
      ctx.fillStyle="rgba(255,255,255,0.12)";ctx.font=`6.5px 'DM Mono',monospace`;ctx.fillText("JOINT_STATE",px,py-2);
      [[d1,"J1"],[d2,"J2"],[d3,"J3"]].forEach(([deg,lbl],i)=>{
        const row=py+14+i*25;
        ctx.fillStyle="rgba(255,255,255,0.18)";ctx.fillText(lbl as string,px,row+8);
        // Arc gauge
        const gCx=px+35,gCy=row+8,gR=9;
        ctx.beginPath();ctx.arc(gCx,gCy,gR,-PI*0.8,PI*0.8);ctx.strokeStyle="rgba(255,255,255,0.07)";ctx.lineWidth=2.5;ctx.stroke();
        const filled=((deg as number)/360)*PI*1.6-PI*0.8;
        ctx.beginPath();ctx.arc(gCx,gCy,gR,-PI*0.8,filled);ctx.strokeStyle="rgba(255,255,255,0.42)";ctx.lineWidth=2.5;ctx.stroke();
        ctx.fillStyle="rgba(255,255,255,0.36)";ctx.font=`6.5px 'DM Mono',monospace`;ctx.fillText(`${(deg as number).toFixed(1)}°`,px+56,row+9);
      });

      tick.current+=0.013;
      if(!reduced)raf.current=requestAnimationFrame(draw);
    };
    raf.current=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("resize",resize);};
  },[lowPower]);
  return <canvas ref={cvs} className="absolute inset-0 w-full h-full pointer-events-none"/>;
}

/* ─── BACKGROUNDS ────────────────────────────────────────────────── */
function CircuitBg({opacity=0.04}:{opacity?:number}) {
  return <div className="absolute inset-0 pointer-events-none" style={{opacity,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='none' stroke='white' stroke-width='0.6'%3E%3Cpath d='M0 60 H38 Q42 60 42 56 V0'/%3E%3Cpath d='M120 60 H82 Q78 60 78 56 V0'/%3E%3Cpath d='M60 120 V82 Q60 78 56 78 H0'/%3E%3Cpath d='M60 0 V38 Q60 42 64 42 H120'/%3E%3Cpath d='M0 20 H18 Q22 20 22 24 V38 Q22 42 26 42 H40'/%3E%3Cpath d='M120 100 H102 Q98 100 98 96 V82 Q98 78 94 78 H80'/%3E%3C/g%3E%3Ccircle cx='42' cy='28' r='3' fill='none' stroke='white' stroke-width='0.6'/%3E%3Ccircle cx='78' cy='28' r='3' fill='none' stroke='white' stroke-width='0.6'/%3E%3Ccircle cx='22' cy='38' r='2' fill='white' opacity='0.4'/%3E%3Ccircle cx='98' cy='82' r='2' fill='white' opacity='0.4'/%3E%3C/svg%3E")`,backgroundSize:"120px 120px"}}/>;
}
function HexDotBg({opacity=0.04,dark=true}:{opacity?:number;dark?:boolean}) {
  const c=dark?"255,255,255":"0,0,0";
  return <div className="absolute inset-0 pointer-events-none" style={{opacity,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='70'%3E%3Ccircle cx='20' cy='17' r='1.1' fill='rgba(${c},1)'/%3E%3Ccircle cx='0' cy='52' r='1.1' fill='rgba(${c},1)'/%3E%3Ccircle cx='40' cy='52' r='1.1' fill='rgba(${c},1)'/%3E%3C/svg%3E")`,backgroundSize:"40px 70px"}}/>;
}

/* ─── SKILL RADAR ────────────────────────────────────────────────── */
function SkillRadar() {
  const ref=useRef<SVGSVGElement>(null);
  const inView=useInView(ref,{once:true,margin:"-15%"});
  const SZ=260,C=SZ/2,R=SZ*0.4;
  const levels=[0.28,0.52,0.75,1.0];
  const pts=SKILLS_DOMAINS.map((d,i)=>{
    const a=((i/SKILLS_DOMAINS.length)*Math.PI*2)-Math.PI/2;
    return {x:C+Math.cos(a)*R*d.score,y:C+Math.sin(a)*R*d.score,lx:C+Math.cos(a)*(R+22),ly:C+Math.sin(a)*(R+22),lbl:d.label,score:d.score,ang:a};
  });
  const poly=pts.map(p=>`${p.x},${p.y}`).join(" ");
  return (
    <svg ref={ref} width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`} className="shrink-0">
      {levels.map(l=><circle key={l} cx={C} cy={C} r={R*l} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.7" strokeDasharray={l===1?"4 6":""}/>)}
      {SKILLS_DOMAINS.map((_,i)=>{const a=((i/SKILLS_DOMAINS.length)*Math.PI*2)-Math.PI/2;return <line key={i} x1={C} y1={C} x2={C+Math.cos(a)*R} y2={C+Math.sin(a)*R} stroke="rgba(255,255,255,0.12)" strokeWidth="0.7"/>;}) }
      <motion.polygon points={poly} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" initial={{scale:0,opacity:0}} animate={inView?{scale:1,opacity:1}:{}} style={{transformOrigin:`${C}px ${C}px`}} transition={{duration:1.4,ease:[0.22,1,0.36,1]}}/>
      {pts.map((p,i)=>(
        <g key={i}>
          <motion.circle cx={p.x} cy={p.y} r={4.5} fill="rgba(255,255,255,0.55)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" initial={{scale:0}} animate={inView?{scale:1}:{}} transition={{delay:0.9+i*0.1,type:"spring",stiffness:160,damping:14}}/>
          <motion.text x={p.lx} y={p.ly} textAnchor={Math.cos(p.ang)>0.1?"start":Math.cos(p.ang)<-0.1?"end":"middle"} fill="rgba(255,255,255,0.35)" fontSize="8.5" fontFamily="'DM Mono',monospace" letterSpacing="0.15em" initial={{opacity:0}} animate={inView?{opacity:1}:{}} transition={{delay:1.1+i*0.08}}>{p.lbl.toUpperCase()}</motion.text>
        </g>
      ))}
      <circle cx={C} cy={C} r={3} fill="rgba(255,255,255,0.3)"/>
    </svg>
  );
}

/* ─── ROBOTIC NAVBAR ─────────────────────────────────────────────── */
/* ─── NAV LINK ───────────────────────────────────────────────────── */
function NavLink({n,idx,active,lm}:{n:string;idx:number;active:boolean;lm:boolean}) {
  const [hov,setHov]=useState(false);
  const on=active||hov;
  const hi=lm?"#0a0a0a":"#fff";
  const lo=lm?"rgba(0,0,0,0.32)":"rgba(255,255,255,0.32)";
  return (
    <a href={`#${n.toLowerCase()}`} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{textDecoration:"none",position:"relative",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:5,padding:"6px 0 10px"}}>
      {/* index */}
      <span style={{fontFamily:MN,fontSize:"9px",letterSpacing:"0.3em",lineHeight:1,
        color:on?(lm?"rgba(0,0,0,0.5)":"rgba(255,255,255,0.5)"):(lm?"rgba(0,0,0,0.18)":"rgba(255,255,255,0.16)"),
        transition:"color .22s"}}>
        {String(idx+1).padStart(2,"0")}
      </span>
      {/* name */}
      <span style={{fontFamily:MN,fontSize:"12px",letterSpacing:"0.2em",textTransform:"uppercase",
        color:on?hi:lo,transition:"color .22s",lineHeight:1,fontWeight:active?500:400}}>
        {n}
      </span>
      {/* bottom indicator */}
      <motion.span style={{position:"absolute",bottom:0,left:0,right:0,height:"1.5px",
        background:hi,originX:0,borderRadius:1}}
        animate={{scaleX:on?1:0}} transition={{duration:0.3,ease:[0.22,1,0.36,1]}}/>
    </a>
  );
}

/* ─── NAV ────────────────────────────────────────────────────────── */
function Nav({onHireClick,onRecruiterClick}:{onHireClick:()=>void;onRecruiterClick:()=>void}) {
  const [open,setOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const [lightMode,setLightMode]=useState(false);
  const [activeSection,setActiveSection]=useState("home");
  const [mounted,setMounted]=useState(false);
  const [angle,setAngle]=useState(0);

  useEffect(()=>{
    setMounted(true);
    const id=setInterval(()=>setAngle(a=>(a+0.3)%360),40);
    return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    const check=()=>{
      setScrolled(window.scrollY>24);
      let lm=false;
      ["lab","about","site-footer"].forEach(sid=>{
        const el=document.getElementById(sid);
        if(el){const r=el.getBoundingClientRect();if(r.top<=100&&r.bottom>=0)lm=true;}
      });
      setLightMode(lm);
      const secs=["home","work","lab","about","skills","contact"];
      for(const s of secs){
        const el=document.getElementById(s);
        if(el){const r=el.getBoundingClientRect();if(r.top<=170&&r.bottom>=0){setActiveSection(s);break;}}
      }
    };
    window.addEventListener("scroll",check,{passive:true});check();
    return()=>window.removeEventListener("scroll",check);
  },[]);

  const lm=lightMode;
  const lCol=lm?"#0a0a0a":"#fff";
  const bg=scrolled?(lm?"rgba(236,232,225,0.97)":"rgba(5,5,5,0.96)"):"rgba(0,0,0,0)";
  const links=["Work","Lab","About","Skills","Contact"];

  /* CTA button style — solid/filled (inverted from page) */
  const ctaBg=lm?"#0a0a0a":"#fff";
  const ctaCol=lm?"#fff":"#0a0a0a";
  const ctaBgHov=lm?"rgba(0,0,0,0.82)":"rgba(255,255,255,0.88)";

  return (
    <>
      <motion.header
        initial={{opacity:0}} animate={{opacity:mounted?1:0}} transition={{duration:0.5}}
        style={{position:"fixed",top:0,left:0,right:0,zIndex:50,
          backdropFilter:scrolled?"blur(36px) saturate(2)":"none",
          background:bg,
          transition:"background .45s,backdrop-filter .45s"}}>

        {/* Permanent 1px top accent line */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,
          background:lm?"rgba(0,0,0,0.1)":"rgba(255,255,255,0.1)",
          pointerEvents:"none"}}/>

        {/* Bottom border — fades in on scroll */}
        <motion.div style={{position:"absolute",bottom:0,left:0,right:0,height:1,
          background:lm?"rgba(0,0,0,0.1)":"rgba(255,255,255,0.08)",
          pointerEvents:"none"}}
          animate={{opacity:scrolled?1:0}} transition={{duration:0.35}}/>

        {/* HUD corner marks */}
        <AnimatePresence>
          {scrolled&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.4}}
              style={{position:"absolute",inset:0,pointerEvents:"none"}}>
              <HUDCorners lCol={lm?"rgba(0,0,0,0.28)":"rgba(255,255,255,0.3)"} size={14}/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan sweep */}
        <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
          <motion.div style={{position:"absolute",top:0,bottom:0,width:"20%",
            background:"linear-gradient(to right,transparent,rgba(255,255,255,0.05),transparent)"}}
            animate={{x:["-22%","122%"]}} transition={{duration:4.5,repeat:Infinity,repeatDelay:16,ease:"linear"}}/>
        </div>

        {/* ── Inner layout ── */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          height:90,
          padding:"0 clamp(1.5rem,4.5vw,4rem)"}}>

          {/* Logo */}
          <a href="#" style={{color:lCol,textDecoration:"none",transition:"color .3s",
            display:"flex",alignItems:"center",gap:16,flexShrink:0}}>

            {/* Joint SVG — 48px */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="h-9 w-9 md:h-12 md:w-12">
              {/* Outermost orbit ring */}
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2.5 5.5" opacity="0.35"
                style={{transformOrigin:"24px 24px",animation:"gs 14s linear infinite"}}/>
              {/* Counter-rotating diamond */}
              <rect x="9" y="9" width="30" height="30" stroke="currentColor" strokeWidth="0.5" opacity="0.14"
                style={{transformOrigin:"24px 24px",animation:"gs 28s linear infinite reverse"}}/>
              {/* Cardinal tick marks — longer, bolder */}
              <line x1="24" y1="1" x2="24" y2="9" stroke="currentColor" strokeWidth="1.6" opacity="0.9" strokeLinecap="round"/>
              <line x1="24" y1="39" x2="24" y2="47" stroke="currentColor" strokeWidth="1.6" opacity="0.9" strokeLinecap="round"/>
              <line x1="1" y1="24" x2="9" y2="24" stroke="currentColor" strokeWidth="1.6" opacity="0.9" strokeLinecap="round"/>
              <line x1="39" y1="24" x2="47" y2="24" stroke="currentColor" strokeWidth="1.6" opacity="0.9" strokeLinecap="round"/>
              {/* 45° diagonal minor ticks */}
              <line x1="7.5" y1="7.5" x2="11" y2="11" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeLinecap="round"/>
              <line x1="40.5" y1="7.5" x2="37" y2="11" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeLinecap="round"/>
              <line x1="7.5" y1="40.5" x2="11" y2="37" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeLinecap="round"/>
              <line x1="40.5" y1="40.5" x2="37" y2="37" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeLinecap="round"/>
              {/* Outer joint ring */}
              <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="1.8"/>
              {/* Mid ring */}
              <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="0.8" opacity="0.45"/>
              {/* Center bearing */}
              <circle cx="24" cy="24" r="2.2" fill="currentColor"/>
              {/* Orbiting bolt holes — 4 pcs */}
              {[0,1,2,3].map(i=>{
                const a=(i/4)*Math.PI*2+Math.PI/4+(angle*Math.PI/180);
                return <circle key={i} cx={24+Math.cos(a)*6} cy={24+Math.sin(a)*6} r="1.2" fill="currentColor" opacity="0.55"/>;
              })}
            </svg>

            {/* Divider */}
            <div className="hidden sm:block" style={{width:1,height:36,background:lm?"rgba(0,0,0,0.12)":"rgba(255,255,255,0.12)"}}/>

            {/* Wordmark */}
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <div style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(0.95rem,4.8vw,1.45rem)",letterSpacing:"-0.04em",lineHeight:1}}>
                ALPHIN FRANCIS
              </div>
              <div className="hidden sm:block" style={{fontFamily:MN,fontSize:"9px",letterSpacing:"0.32em",lineHeight:1,
                color:lm?"rgba(0,0,0,0.36)":"rgba(255,255,255,0.36)"}}>
                ROBOTICS · ENG
              </div>
            </div>
          </a>

          {/* Nav links — centered */}
          <nav className="hidden lg:flex items-end gap-8">
            {links.map((n,i)=>(
              <NavLink key={n} n={n} idx={i} active={activeSection===n.toLowerCase()} lm={lm}/>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="hidden lg:flex items-center gap-5" style={{flexShrink:0}}>
            <motion.button onClick={onRecruiterClick} whileHover={{opacity:1}} whileTap={{scale:0.97}}
              style={{fontFamily:MN,fontSize:"9px",letterSpacing:"0.16em",color:lm?"rgba(0,0,0,0.7)":"rgba(255,255,255,0.72)",background:"transparent",border:"none",padding:"10px 0",opacity:0.78,cursor:"none"}}>
              RECRUITER MODE
            </motion.button>
            {/* HIRE ME — opens modal */}
            <motion.button onClick={onHireClick}
              whileHover={{scale:1.02}} whileTap={{scale:0.97}}
              style={{fontFamily:MN,fontSize:"11px",letterSpacing:"0.18em",
                padding:"12px 28px",
                background:ctaBg,color:ctaCol,
                display:"flex",alignItems:"center",gap:8,border:"none",
                cursor:"none",transition:"background .22s,opacity .22s"}}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=ctaBgHov}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=ctaBg}>
              HIRE ME <ArrowUpRight size={13}/>
            </motion.button>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden" onClick={()=>setOpen(o=>!o)}
            style={{color:lCol,fontFamily:MN,fontSize:"10px",letterSpacing:"0.22em",
              border:`1px solid ${lm?"rgba(0,0,0,0.18)":"rgba(255,255,255,0.15)"}`,
              padding:"9px 12px",background:"transparent",cursor:"none",
              transition:"color .25s,border-color .25s"}}>
            {open?"CLOSE":"MENU"}
          </button>
        </div>
      </motion.header>

      {/* Mobile fullscreen */}
      <AnimatePresence>
        {open&&(
          <motion.div
            initial={{clipPath:"inset(0 0 100% 0)"}}
            animate={{clipPath:"inset(0 0 0% 0)"}}
            exit={{clipPath:"inset(0 0 100% 0)"}}
            transition={{duration:0.72,ease:[0.22,1,0.36,1]}}
            style={{position:"fixed",inset:0,zIndex:40,background:"#060606",
              display:"flex",flexDirection:"column",justifyContent:"center",
              padding:"0 clamp(2rem,8vw,6rem)",gap:24}}>
            <CircuitBg opacity={0.04}/>
            <GearDecor size={260} teeth={16} speed={28} opacity={0.04} x="74%" y="50%" reverse/>
            <div style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.55)",letterSpacing:"0.3em",marginBottom:12}}>
              SYS ▸ NAVIGATE
            </div>
            {links.map((n,i)=>(
              <motion.a key={n} href={`#${n.toLowerCase()}`}
                initial={{x:-80,opacity:0}} animate={{x:0,opacity:1}}
                transition={{delay:i*0.07,ease:[0.22,1,0.36,1]}}
                onClick={()=>setOpen(false)}
                style={{textDecoration:"none",display:"flex",alignItems:"baseline",gap:20}}>
                <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.5)",letterSpacing:"0.16em",minWidth:24}}>
                  {String(i+1).padStart(2,"0")}
                </span>
                <span style={{fontFamily:BG,fontWeight:900,
                  fontSize:"clamp(3rem,12vw,7rem)",
                  color:"#fff",letterSpacing:"-0.045em",lineHeight:0.86}}>
                  {n}
                </span>
              </motion.a>
            ))}
            <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:8}}>
              {[{I:Linkedin,href:"https://www.linkedin.com/in/alphin-francis"},{I:Mail,href:"mailto:alphinfrancis7@gmail.com"}].map(({I,href},i)=>(
                <a key={i} href={href}
                  style={{width:40,height:40,border:"1px solid rgba(255,255,255,0.1)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:"rgba(255,255,255,0.4)"}}>
                  <I size={15}/>
                </a>
              ))}
              <motion.button onClick={()=>{setOpen(false);onHireClick();}}
                style={{fontFamily:MN,fontSize:"9px",letterSpacing:"0.2em",border:"1px solid rgba(255,255,255,0.28)",
                  color:"#fff",padding:"0 24px",height:40,background:"rgba(255,255,255,0.06)",cursor:"none"}}>
                HIRE ME
              </motion.button>
              <motion.button onClick={()=>{setOpen(false);onRecruiterClick();}}
                style={{fontFamily:MN,fontSize:"9px",letterSpacing:"0.14em",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",padding:"0 18px",height:40,background:"transparent",cursor:"none"}}>
                RECRUITER
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── ANIMATION HELPERS ──────────────────────────────────────────── */
function WordReveal({text,delay=0,stagger=0.07,color}:{text:string;delay?:number;stagger?:number;color?:string}) {
  const ref=useRef<HTMLSpanElement>(null);
  const inView=useInView(ref,{once:true,margin:"-6% 0px"});
  return (
    <span ref={ref} aria-label={text} style={{display:"inline"}}>
      {text.split(" ").map((w,i)=>(
        <span key={i} style={{display:"inline-block",overflow:"hidden",verticalAlign:"bottom",marginRight:"0.22em"}}>
          <motion.span style={{display:"inline-block",color:color||"inherit"}} initial={{y:"112%",skewY:5}} animate={inView?{y:"0%",skewY:0}:{}} transition={{delay:delay+i*stagger,duration:0.85,ease:[0.22,1,0.36,1]}}>{w}</motion.span>
        </span>
      ))}
    </span>
  );
}
function Counter({to,suffix=""}:{to:number;suffix?:string}) {
  const ref=useRef<HTMLSpanElement>(null);const inView=useInView(ref,{once:true});
  const mv=useMotionValue(0);const sp=useSpring(mv,{stiffness:48,damping:18});
  const [d,setD]=useState("0");
  useEffect(()=>{if(inView)mv.set(to);},[inView,to,mv]);
  useEffect(()=>sp.on("change",v=>setD(Math.round(v)+suffix)),[sp,suffix]);
  return <span ref={ref}>{d}</span>;
}
function Mag({children,str=0.24}:{children:React.ReactElement;str?:number}) {
  const ref=useRef<HTMLDivElement>(null);
  const x=useMotionValue(0),y=useMotionValue(0);
  const sx=useSpring(x,{stiffness:200,damping:16}),sy=useSpring(y,{stiffness:200,damping:16});
  return (
    <motion.div ref={ref} style={{x:sx,y:sy,display:"inline-block"}} onMouseMove={e=>{const r=ref.current!.getBoundingClientRect();x.set((e.clientX-r.left-r.width/2)*str);y.set((e.clientY-r.top-r.height/2)*str);}} onMouseLeave={()=>{x.set(0);y.set(0);}}>{children}</motion.div>
  );
}

/* ─── CURSOR ─────────────────────────────────────────────────────── */
function Cursor() {
  const mx=useMotionValue(-400),my=useMotionValue(-400);
  const rx=useMotionValue(-400),ry=useMotionValue(-400);
  const bx=useMotionValue(-400),by=useMotionValue(-400);
  const srx=useSpring(rx,{stiffness:180,damping:22}),sry=useSpring(ry,{stiffness:180,damping:22});
  const sbx=useSpring(bx,{stiffness:90,damping:20}),sby=useSpring(by,{stiffness:90,damping:20});
  const [label,setLabel]=useState(""),[active,setActive]=useState(false);
  const [sweep,setSweep]=useState(0);
  useEffect(()=>{if(window.matchMedia("(pointer:coarse)").matches)return;let r:number,a=0;const t=()=>{a=(a+0.65)%360;setSweep(a);r=requestAnimationFrame(t);};r=requestAnimationFrame(t);return()=>cancelAnimationFrame(r);},[]);
  useEffect(()=>{
    if(window.matchMedia("(pointer:coarse)").matches)return;
    const mv=(e:MouseEvent)=>{mx.set(e.clientX);my.set(e.clientY);rx.set(e.clientX);ry.set(e.clientY);bx.set(e.clientX);by.set(e.clientY);};
    window.addEventListener("mousemove",mv);
    const wire=()=>{
      document.querySelectorAll("[data-cur]").forEach(el=>{const l=el.getAttribute("data-cur")??"";el.addEventListener("mouseenter",()=>{setActive(true);setLabel(l);});el.addEventListener("mouseleave",()=>{setActive(false);setLabel("");});});
      document.querySelectorAll("a:not([data-cur]),button:not([data-cur])").forEach(el=>{el.addEventListener("mouseenter",()=>setActive(true));el.addEventListener("mouseleave",()=>setActive(false));});
    };
    wire();const mo=new MutationObserver(wire);mo.observe(document.body,{childList:true,subtree:true});
    return()=>{window.removeEventListener("mousemove",mv);mo.disconnect();};
  },[mx,my,rx,ry,bx,by]);
  const S=active?64:40,B=active?84:58,bL=active?9:12;
  return (
    <>
      <motion.div className="robot-cursor fixed z-[9999] pointer-events-none rounded-full" animate={{scale:active?0.65:1}} style={{x:mx,y:my,translateX:"-50%",translateY:"-50%",width:10,height:10,background:"#fff",border:"2px solid #080808",boxShadow:"0 0 0 1px rgba(255,255,255,0.95),0 0 12px rgba(0,0,0,0.65)"}}/>
      <motion.svg className="robot-cursor fixed z-[9998] pointer-events-none overflow-visible" style={{x:srx,y:sry,translateX:"-50%",translateY:"-50%",width:S,height:S,transition:"width .15s,height .15s",filter:"drop-shadow(0 0 1px #000) drop-shadow(0 0 3px rgba(0,0,0,0.7))"}}>
        <line x1={0} y1={S/2} x2={S*0.28} y2={S/2} stroke="white" strokeWidth="0.9" opacity="0.55"/>
        <line x1={S*0.72} y1={S/2} x2={S} y2={S/2} stroke="white" strokeWidth="0.9" opacity="0.55"/>
        <line x1={S/2} y1={0} x2={S/2} y2={S*0.28} stroke="white" strokeWidth="0.9" opacity="0.55"/>
        <line x1={S/2} y1={S*0.72} x2={S/2} y2={S} stroke="white" strokeWidth="0.9" opacity="0.55"/>
        <circle cx={S/2} cy={S/2} r={active?9:6} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.8)" strokeWidth="1"/>
      </motion.svg>
      <motion.svg className="robot-cursor fixed z-[9997] pointer-events-none overflow-visible" style={{x:sbx,y:sby,translateX:"-50%",translateY:"-50%",width:B,height:B,transition:"width .2s,height .2s",filter:"drop-shadow(0 0 1px #000)"}}>
        <circle cx={B/2} cy={B/2} r={B/2-2} fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="0.9" strokeDasharray="3 8" style={{transformOrigin:`${B/2}px ${B/2}px`,transform:`rotate(${sweep}deg)`}}/>
        <circle cx={B/2+Math.cos(sweep*Math.PI/180)*(B/2-2)} cy={B/2+Math.sin(sweep*Math.PI/180)*(B/2-2)} r="2.2" fill="white"/>
        <path d={`M${bL} 2 L2 2 L2 ${bL}`} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" strokeLinecap="round"/>
        <path d={`M${B-bL} 2 L${B-2} 2 L${B-2} ${bL}`} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" strokeLinecap="round"/>
        <path d={`M${bL} ${B-2} L2 ${B-2} L2 ${B-bL}`} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" strokeLinecap="round"/>
        <path d={`M${B-bL} ${B-2} L${B-2} ${B-2} L${B-2} ${B-bL}`} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" strokeLinecap="round"/>
        {(active||label)&&<text x={B/2} y={B/2+3.5} textAnchor="middle" fill="white" stroke="#080808" strokeWidth="2.5" paintOrder="stroke" fontSize="9" fontFamily="'DM Mono',monospace" letterSpacing="1.3">{label||"OPEN"}</text>}
      </motion.svg>
    </>
  );
}
function ProgressBar() {
  const {scrollYProgress}=useScroll();
  const sx=useSpring(scrollYProgress,{stiffness:50,damping:18});
  return <motion.div className="fixed top-0 left-0 right-0 z-[9997] origin-left" style={{scaleX:sx,height:1.5,background:"#fff"}}/>;
}

/* ─── PRELOADER ──────────────────────────────────────────────────── */
function Preloader({onDone}:{onDone:()=>void}) {
  const [pct,setPct]=useState(0),[phase,setPhase]=useState<"count"|"exit">("count"),[msgs,setMsgs]=useState<string[]>([]);
  const BOOT=["CONTROL SYSTEM READY","VISION PIPELINE ACTIVE","JOINT STATE ONLINE","ALL SYSTEMS NOMINAL"];
  useEffect(()=>{
    const s=performance.now(),d=2600;let r:number;
    const tick=(n:number)=>{const p=Math.min((n-s)/d,1);setPct(Math.floor(p*100));setMsgs(BOOT.slice(0,Math.floor(p*BOOT.length)+1));if(p<1){r=requestAnimationFrame(tick);}else{setPhase("exit");setTimeout(onDone,980);}};
    r=requestAnimationFrame(tick);return()=>cancelAnimationFrame(r);
  },[onDone]);
  return (
    <motion.div className="fixed inset-0 z-[9999] overflow-hidden" style={{background:"#f0ede7"}}
      animate={phase==="exit"?{clipPath:"inset(100% 0 0 0)"}:{clipPath:"inset(0% 0 0 0)"}} initial={{clipPath:"inset(0% 0 0 0)"}} transition={{duration:1.0,ease:[0.76,0,0.24,1]}}>
      <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"repeating-linear-gradient(0deg,rgba(0,0,0,0.04) 0px,rgba(0,0,0,0.04) 1px,transparent 1px,transparent 55px),repeating-linear-gradient(90deg,rgba(0,0,0,0.04) 0px,rgba(0,0,0,0.04) 1px,transparent 1px,transparent 55px)"}}/>
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{backgroundImage:NOISE,backgroundSize:"256px 256px"}}/>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 420 500" style={{width:"min(420px,90vw)",height:"auto",overflow:"visible"}}>
          <motion.path d="M 110,450 L 310,450 L 300,430 L 120,430 Z" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="1.4" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:0.45,delay:0.1}}/>
          <motion.path d="M 145,412 L 275,412 L 275,430 L 145,430 Z" fill="none" stroke="rgba(0,0,0,0.38)" strokeWidth="0.9" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:0.35,delay:0.28}}/>
          {[155,265].map((bx,i)=><motion.circle key={i} cx={bx} cy={441} r={6} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="0.8" initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.4+i*0.06}}/>)}
          <motion.path d="M 186,390 L 186,412 L 234,412 L 234,390" fill="none" stroke="rgba(0,0,0,0.38)" strokeWidth="1" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:0.3,delay:0.5}}/>
          <motion.circle cx={210} cy={382} r={22} fill="rgba(240,237,231,0.8)" stroke="rgba(0,0,0,0.48)" strokeWidth="1.2" initial={{scale:0}} animate={{scale:1}} transition={{delay:0.62,type:"spring",stiffness:180,damping:14}}/>
          <motion.circle cx={210} cy={382} r={10} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="0.8" initial={{scale:0}} animate={{scale:1}} transition={{delay:0.68}}/>
          {[0,1,2,3].map(i=>{const a=(i/4)*Math.PI*2+Math.PI/4;return <motion.circle key={i} cx={210+Math.cos(a)*14.5} cy={382+Math.sin(a)*14.5} r={2.5} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.7" initial={{scale:0}} animate={{scale:1}} transition={{delay:0.72+i*0.04}}/>;}) }
          <motion.path d="M 200,362 L 158,228 L 176,220 L 217,355 Z" fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.5)" strokeWidth="1.1" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:0.55,delay:0.72}}/>
          <motion.circle cx={167} cy={224} r={18} fill="rgba(240,237,231,0.8)" stroke="rgba(0,0,0,0.48)" strokeWidth="1.1" initial={{scale:0}} animate={{scale:1}} transition={{delay:1.0,type:"spring",stiffness:180,damping:14}}/>
          <motion.circle cx={167} cy={224} r={8} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="0.8" initial={{scale:0}} animate={{scale:1}} transition={{delay:1.06}}/>
          <motion.path d="M 158,208 L 232,118 L 248,128 L 174,218 Z" fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.48)" strokeWidth="1" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:0.48,delay:1.1}}/>
          <motion.circle cx={240} cy={123} r={14} fill="rgba(240,237,231,0.8)" stroke="rgba(0,0,0,0.46)" strokeWidth="1" initial={{scale:0}} animate={{scale:1}} transition={{delay:1.38,type:"spring",stiffness:180,damping:14}}/>
          <motion.path d="M 237,110 L 295,94 L 300,110 L 242,126 Z" fill="rgba(0,0,0,0.03)" stroke="rgba(0,0,0,0.42)" strokeWidth="0.9" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:0.35,delay:1.48}}/>
          <motion.circle cx={297} cy={102} r={10} fill="none" stroke="rgba(0,0,0,0.38)" strokeWidth="0.9" initial={{scale:0}} animate={{scale:1}} transition={{delay:1.65}}/>
          <motion.path d="M 296,94 L 334,79 M 296,110 L 334,125" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="1.1" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:0.28,delay:1.72}}/>
          <motion.path d="M 334,79 L 340,92 M 334,125 L 340,112" fill="none" stroke="rgba(0,0,0,0.32)" strokeWidth="0.9" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:0.2,delay:1.88}}/>
          <motion.path d="M 210,450 L 60,450 L 60,475 L 20,475 M 210,450 L 370,450 L 400,420" fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth="0.7" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:0.5,delay:2.0}}/>
          {["J1 — SHOULDER ROT","J2 — ELBOW PITCH","J3 — WRIST YAW"].map((t,i)=>(
            <motion.text key={t} x={i===2?252:i===1?38:68} y={i===2?82:i===1?228:388} fill="rgba(0,0,0,0.2)" fontSize="8" fontFamily="'DM Mono',monospace" letterSpacing="1.5" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.0+i*0.08}}>{t}</motion.text>
          ))}
          <motion.line x1={210} y1={460} x2={250} y2={460} stroke="rgba(220,80,80,0.4)" strokeWidth="1" initial={{scaleX:0}} animate={{scaleX:1}} style={{transformOrigin:"210px 460px"}} transition={{delay:0.9}}/>
          <motion.line x1={210} y1={460} x2={210} y2={428} stroke="rgba(80,140,220,0.4)" strokeWidth="1" initial={{scaleY:0}} animate={{scaleY:1}} style={{transformOrigin:"210px 460px"}} transition={{delay:0.95}}/>
        </svg>
      </div>
      <div className="relative flex justify-between items-center px-8 md:px-14 pt-9">
        <span style={{fontFamily:BG,fontWeight:900,fontSize:"0.88rem",color:"#0a0a0a",letterSpacing:"-0.02em"}}>ALPHIN FRANCIS</span>
        <span style={{fontFamily:MN,fontSize:"9.5px",color:"rgba(0,0,0,0.52)",letterSpacing:"0.2em"}}>SYSTEM INIT · 2026</span>
      </div>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}} className="absolute left-8 md:left-14 bottom-28 space-y-1.5">
        {msgs.map((m,i)=><motion.div key={i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} style={{fontFamily:MN,fontSize:"9px",color:"rgba(0,0,0,0.5)",letterSpacing:"0.14em"}}>{m}</motion.div>)}
      </motion.div>
      <div className="absolute right-6 md:right-14 bottom-7 flex items-baseline gap-2">
        <span style={{fontFamily:BG,fontWeight:900,color:"#0a0a0a",letterSpacing:"-0.065em",fontSize:"clamp(5rem,18vw,13rem)",lineHeight:0.82}}>{String(pct).padStart(2,"0")}</span>
        <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(0,0,0,0.5)",letterSpacing:"0.16em",alignSelf:"flex-end",marginBottom:"1rem"}}>%</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{background:"rgba(0,0,0,0.06)"}}>
        <div style={{height:"100%",background:"rgba(0,0,0,0.35)",width:`${pct}%`,transition:"width .08s linear"}}/>
      </div>
    </motion.div>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────── */
function Hero({ready,lowPower,onViewCV}:{ready:boolean;lowPower:boolean;onViewCV:()=>void}) {
  const ref=useRef<HTMLElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start start","end start"]});
  const nameY=useTransform(scrollYProgress,[0,1],[0,-280]);
  const nameOp=useTransform(scrollYProgress,[0,0.5],[1,0]);
  const armOp=useTransform(scrollYProgress,[0,0.7],[1,0]);
  const armSc=useTransform(scrollYProgress,[0,1],[1,1.18]);
  const [roleIdx,setRoleIdx]=useState(0);
  useEffect(()=>{if(!ready)return;const id=setInterval(()=>setRoleIdx(i=>(i+1)%ROLES.length),3200);return()=>clearInterval(id);},[ready]);
  return (
    <section ref={ref} id="home" className="min-h-[100svh] flex flex-col overflow-hidden" style={{position:"relative"}}>
      {/* Particle field */}
      {!lowPower&&<motion.div className="absolute inset-0" style={{opacity:armOp}}><ParticleField/></motion.div>}
      {/* Robot arm canvas */}
      <motion.div className="absolute inset-0" style={{opacity:armOp,scale:armSc}}>
        <RobotArmCanvas lowPower={lowPower}/>
      </motion.div>
      {/* Scan sweep */}
      {!lowPower&&<ScanSweep/>}
      {/* HUD frame corners */}
      <HUDFrame label="CTRL_SYS_ACTIVE" sublabel="TU·DORTMUND·2026"/>
      {/* Gradient masks */}
      <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 80% 70% at 60% 55%,transparent 25%,rgba(8,8,8,0.75) 100%)",zIndex:2}}/>
      <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(to right,rgba(8,8,8,0.96) 0%,rgba(8,8,8,0.62) 42%,rgba(8,8,8,0.08) 68%,transparent 100%)",zIndex:2}}/>
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{height:"40%",background:"linear-gradient(to top,#080808,transparent)",zIndex:2}}/>
      <div className="absolute inset-0 pointer-events-none opacity-[0.018]" style={{backgroundImage:NOISE,backgroundSize:"256px 256px",zIndex:3}}/>
      {/* CRT scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"repeating-linear-gradient(0deg,rgba(0,0,0,0.035) 0px,rgba(0,0,0,0.035) 1px,transparent 1px,transparent 3px)",backgroundSize:"100% 3px",zIndex:6}}/>

      {/* Top bar */}
      <motion.div initial={{opacity:0}} animate={{opacity:ready?1:0}} transition={{delay:0.6,duration:0.8}} className="relative px-5 pt-24 md:px-14 md:pt-28" style={{zIndex:10}}>
        <TypeBot text="ROBOTICS / AUTOMATION" delay={0.8} speed={22} style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.65)",letterSpacing:"0.22em"}}/>
      </motion.div>

      {/* Main content */}
      <motion.div style={{y:nameY,opacity:nameOp,zIndex:10}} className="relative mt-2 flex flex-1 items-center px-5 py-5 md:px-10 md:py-0">
        <div style={{perspective:"1400px"}}>
          <motion.div initial={{rotateX:8,opacity:0}} animate={{rotateX:0,opacity:ready?1:0}} transition={{delay:0.2,duration:1.2,ease:[0.22,1,0.36,1]}}>
            <h1 style={{fontFamily:BG,fontWeight:900,letterSpacing:"-0.052em",lineHeight:0.78,fontSize:"clamp(3.75rem,23vw,22rem)"}}>
              {ready&&<ScrambleText text="ALPHIN" delay={0.15} style={{display:"block"}}/>}
              {!ready&&<span style={{opacity:0}}>ALPHIN</span>}
              <motion.span initial={{opacity:0}} animate={{opacity:ready?0.5:0}} transition={{delay:0.5}} style={{display:"block",fontSize:"clamp(3.75rem,23vw,22rem)",letterSpacing:"-0.052em"}}>FRANCIS.</motion.span>
            </h1>
          </motion.div>

          {ready&&(
            <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:0.9,duration:0.85,ease:[0.22,1,0.36,1]}} className="mt-7 flex items-center gap-4">
              <svg width="20" height="1" viewBox="0 0 20 1"><line x1="0" y1="0.5" x2="20" y2="0.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/></svg>
              <div className="min-w-0 md:min-w-[320px]" style={{height:"1.85rem",overflow:"hidden",position:"relative",width:"min(82vw,520px)"}}>
                <AnimatePresence mode="wait">
                  <motion.p key={roleIdx} initial={{y:"110%",opacity:0}} animate={{y:"0%",opacity:1}} exit={{y:"-110%",opacity:0}} transition={{duration:0.52,ease:[0.22,1,0.36,1]}}
                    style={{fontFamily:MN,fontSize:"clamp(0.58rem,1.1vw,0.82rem)",color:"rgba(255,255,255,0.78)",letterSpacing:"clamp(0.12em,0.8vw,0.28em)",textTransform:"uppercase",position:"absolute",whiteSpace:"nowrap"}}>
                    {ROLES[roleIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {ready&&(
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:1.15,duration:0.75,ease:[0.22,1,0.36,1]}} className="mt-8 flex flex-wrap gap-2.5">
              <Mag str={0.12}>
                <a href="#work" data-cur="VIEW" className="group flex items-center gap-3 bg-white px-5 py-3 text-black transition-colors hover:bg-white/90 md:px-6"
                  style={{fontFamily:BG,fontWeight:800,fontSize:"0.82rem",textDecoration:"none"}}>
                  View selected work <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/>
                </a>
              </Mag>
              <Mag str={0.1}>
                <button onClick={onViewCV} data-cur="CV" className="group flex items-center gap-3 border border-white/20 bg-black/20 px-5 py-3 text-white backdrop-blur-sm transition-colors hover:border-white/45 hover:bg-white/[0.06] md:px-6"
                  style={{fontFamily:BG,fontWeight:750,fontSize:"0.82rem"}}>
                  View CV
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path d="M1.5 6.5s1.8-3 5-3 5 3 5 3-1.8 3-5 3-5-3-5-3Z M6.5 5.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </button>
              </Mag>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Bottom bar */}
      <motion.div initial={{opacity:0,y:22}} animate={{opacity:ready?1:0,y:ready?0:22}} transition={{delay:1.05,duration:0.9,ease:[0.22,1,0.36,1]}}
        className="flex justify-between items-end px-5 pb-6 pt-4 md:px-14 md:pb-10" style={{borderTop:`1px solid ${BRD}`,position:"relative",zIndex:10}}>
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-30"/>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"/>
          </span>
          <TypeBot text="OPEN TO ROLES · LEVERKUSEN, DE" delay={1.4} speed={30} style={{fontFamily:MN,fontSize:"clamp(9px,2.2vw,10px)",color:"rgba(255,255,255,0.72)",letterSpacing:"0.1em"}}/>
        </div>
        <span className="hidden sm:block" style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.55)",letterSpacing:"0.16em"}}>SCROLL TO EXPLORE · 01</span>
      </motion.div>

      {/* Scroll dot */}
      <motion.div initial={{opacity:0}} animate={{opacity:ready?1:0}} transition={{delay:1.9}} className="absolute bottom-12 left-1/2 hidden -translate-x-1/2 pointer-events-none md:block" style={{zIndex:10}}>
        <div style={{width:1,height:55,background:"linear-gradient(to bottom,rgba(255,255,255,0.25),transparent)",position:"relative",overflow:"hidden"}}>
          <motion.div style={{position:"absolute",top:0,width:"100%",background:"#fff",height:"38%"}} animate={{y:[0,38,0]}} transition={{duration:2.5,repeat:Infinity,ease:"easeInOut"}}/>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── TICKER ─────────────────────────────────────────────────────── */
function Ticker() {
  const items=["ROS1","Python","OpenCV","MATLAB","Open3D","URScript","VAL3","Stäubli","UR RTDE","Gazebo","RViz","RoboDK","Fusion 360","Intel RealSense","CubeEye","SensoPart","C++","Linux","GitLab","VTK","Blender"];
  return (
    <div className="overflow-hidden border-y py-4" style={{borderColor:BRD}}>
      <div className="ambient-loop flex whitespace-nowrap" style={{animation:"ticker 36s linear infinite"}}>
        {[0,1,2].map(r=>(
          <span key={r} className="flex items-center shrink-0">
            {items.map((t,i)=>(
              <span key={i} className="flex items-center">
                <span style={{fontFamily:MN,fontSize:"9.5px",padding:"0 20px",color:"rgba(255,255,255,0.52)",letterSpacing:"0.22em"}}>{t}</span>
                <span style={{color:"rgba(255,255,255,0.07)",fontSize:"0.3rem"}}>◆</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── BIG MARQUEE ────────────────────────────────────────────────── */
function BigMarquee() {
  const ref=useRef<HTMLDivElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start end","end start"]});
  const x=useTransform(scrollYProgress,[0,1],["-3%","3%"]);
  return (
    <div ref={ref} className="overflow-hidden border-b py-8 select-none" style={{borderColor:BRD,position:"relative"}}>
      <GearDecor size={170} teeth={18} speed={30} opacity={0.045} x="4%" y="-25%"/>
      <GearDecor size={100} teeth={12} speed={22} opacity={0.04} x="89%" y="22%" reverse/>
      <motion.div style={{x}} className="flex whitespace-nowrap items-center gap-12">
        {[0,1].map(r=>(
          <span key={r} className="flex items-center gap-12 shrink-0">
            {PROJECTS.map(project=>(
              <span key={project.num} className="flex items-center gap-12">
                <span style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(3.8rem,9.5vw,9rem)",letterSpacing:"-0.05em",color:"rgba(255,255,255,0.085)"}}>{project.short.toUpperCase()}</span>
                <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.04)",letterSpacing:"0.2em"}}>◆</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── WORK SECTION — REFINED HORIZONTAL NARRATIVE ─────────────── */
function WorkPanel({project,i,mobile=false}:{project:typeof PROJECTS[0];i:number;mobile?:boolean}) {
  return (
    <motion.article initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-8%"}} transition={{duration:0.7,ease:[0.22,1,0.36,1]}}
      className={`group relative shrink-0 snap-center overflow-hidden border bg-[#0b0b0b] ${mobile?"h-[78svh] min-h-[560px] max-h-[680px] w-[88vw]":"w-[76vw] h-[calc(100svh-10rem)] min-h-[560px] max-h-[760px]"}`}
      style={{borderColor:"rgba(255,255,255,0.13)"}}>
      <motion.img src={`https://images.unsplash.com/photo-${project.img}?w=${mobile?800:1600}&h=${mobile?1000:1100}&fit=crop&auto=format`} alt={project.title} className="absolute inset-0 h-full w-full object-cover"
        style={{filter:"saturate(0) brightness(0.28) contrast(1.1)"}} whileHover={{scale:1.035,filter:"saturate(0) brightness(0.38) contrast(1.1)"}} transition={{duration:0.8,ease:[0.22,1,0.36,1]}}/>
      <div className="absolute inset-0" style={{background:"linear-gradient(90deg,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.66) 48%,rgba(0,0,0,0.2) 100%),linear-gradient(to top,rgba(0,0,0,0.92),transparent 60%)"}}/>
      <CircuitBg opacity={0.025}/>
      <HUDFrame sublabel={`${project.num}/05 · ${project.year}`}/>
      {!mobile&&<WorkMiniCanvas type={i}/>}
      <div className="absolute inset-0 flex flex-col justify-between p-6 pt-16 md:p-12 md:pt-16">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.68)",letterSpacing:"0.14em"}}>{project.type.toUpperCase()}</div>
            <div className="mt-2" style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.52)",letterSpacing:"0.1em"}}>{project.spec}</div>
          </div>
          <span style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(4rem,9vw,8rem)",color:"rgba(255,255,255,0.13)",lineHeight:0.7}}>{project.num}</span>
        </div>
        <div className="max-w-3xl">
          <h3 style={{fontFamily:BG,fontWeight:900,fontSize:mobile?"clamp(2.5rem,11vw,4rem)":"clamp(3.2rem,6.3vw,7rem)",letterSpacing:"-0.052em",lineHeight:0.84}}>{project.title}</h3>
          <p className="mt-6" style={{fontFamily:MN,fontSize:mobile?"11px":"12px",color:"rgba(255,255,255,0.72)",lineHeight:1.85,maxWidth:"58ch"}}>{project.desc}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {project.tags.map(tag=><span key={tag} className="border border-white/15 bg-black/20 px-3 py-1.5" style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.7)",letterSpacing:"0.08em"}}>{tag}</span>)}
            <a href="#contact" className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/30 transition-colors hover:bg-white hover:text-black" aria-label={`Discuss ${project.title}`}><ArrowUpRight size={15}/></a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function WorkSection() {
  const ref=useRef<HTMLElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start start","end end"]});
  const overflowVw=PROJECTS.length*76+(PROJECTS.length-1)*2+16-100;
  const x=useTransform(scrollYProgress,[0,1],["0vw",`${-overflowVw}vw`]);
  const progress=useTransform(scrollYProgress,[0,1],["0%","100%"]);
  return (
    <div id="work">
      <section ref={ref} className="relative hidden md:block" style={{height:`${100+(PROJECTS.length-1)*78}vh`}}>
        <div className="sticky top-0 h-[100svh] overflow-hidden border-y" style={{borderColor:BRD}}>
          <CircuitBg opacity={0.02}/><HUDFrame label="01_SELECTED_WORK" sublabel="DIRECT_SCROLL_MAPPING · NO_SPRING_LAG"/>
          <div className="absolute left-8 right-8 top-7 z-20 flex items-center justify-between md:left-14 md:right-14">
            <TypeBot text="01 / SELECTED PROJECTS" speed={24} style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.7)",letterSpacing:"0.24em"}}/>
            <span style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.52)",letterSpacing:"0.12em"}}>SCROLL ↓ / TRACK →</span>
          </div>
          <motion.div className="flex h-full items-center gap-[2vw] px-[8vw] pb-8 pt-24 will-change-transform" style={{x}}>
            {PROJECTS.map((project,i)=><WorkPanel key={project.num} project={project} i={i}/>)}
          </motion.div>
          <div className="absolute bottom-5 left-14 right-14 z-20 flex items-center gap-4">
            <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.42)"}}>01</span>
            <div className="h-px flex-1 overflow-hidden bg-white/10"><motion.div className="h-full bg-white" style={{width:progress}}/></div>
            <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.42)"}}>05</span>
          </div>
        </div>
      </section>

      <section className="relative border-y py-20 md:hidden" style={{borderColor:BRD}}>
        <div className="mb-8 px-6"><TypeBot text="01 / SELECTED PROJECTS" speed={24} style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.7)",letterSpacing:"0.24em"}}/><p className="mt-3" style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.52)",letterSpacing:"0.1em"}}>SWIPE TO EXPLORE →</p></div>
        <div className="work-swipe flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4" style={{scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
          {PROJECTS.map((project,i)=><WorkPanel key={project.num} project={project} i={i} mobile/>)}
          <div className="w-2 shrink-0"/>
        </div>
      </section>
    </div>
  );
}

/* ─── INTERACTIVE KINEMATICS LAB ─────────────────────────────────── */
function KinematicsLab() {
  const [angles,setAngles]=useState([34,58,-42]);
  const rad=(deg:number)=>deg*Math.PI/180;
  const base={x:122,y:252},lengths=[104,82,58];
  const a1=rad(angles[0]),a2=a1+rad(angles[1]),a3=a2+rad(angles[2]);
  const j2={x:base.x+Math.cos(a1)*lengths[0],y:base.y-Math.sin(a1)*lengths[0]};
  const j3={x:j2.x+Math.cos(a2)*lengths[1],y:j2.y-Math.sin(a2)*lengths[1]};
  const ee={x:j3.x+Math.cos(a3)*lengths[2],y:j3.y-Math.sin(a3)*lengths[2]};
  const update=(i:number,value:number)=>setAngles(current=>current.map((angle,index)=>index===i?value:angle));
  return (
    <section id="lab" data-theme="light" className="relative overflow-hidden px-6 py-28 md:px-14 md:py-40" style={{background:LIGHT_BG,color:"#0a0a0a"}}>
      <HexDotBg opacity={0.036} dark={false}/>
      <HUDFrame label="02_KINEMATICS_LAB" sublabel="FORWARD_KINEMATICS · 3DOF" dark={false}/>
      <div className="relative mx-auto max-w-screen-2xl">
        <div className="mb-16 grid gap-8 border-b pb-8 lg:grid-cols-[1fr_0.8fr] lg:items-end" style={{borderColor:"rgba(0,0,0,0.12)"}}>
          <div>
            <TypeBot text="INTERACTIVE / ROBOT LAB" speed={26} style={{fontFamily:MN,fontSize:"9px",color:"rgba(0,0,0,0.62)",letterSpacing:"0.3em"}}/>
            <h2 className="mt-7" style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(3.4rem,7.5vw,7.5rem)",letterSpacing:"-0.055em",lineHeight:0.82}}>MOVE THE<br/><span style={{color:"rgba(0,0,0,0.42)"}}>MACHINE.</span></h2>
          </div>
          <p style={{fontFamily:MN,fontSize:"12px",color:"rgba(0,0,0,0.66)",lineHeight:1.9,maxWidth:"55ch"}}>Adjust three joint angles and watch forward kinematics resolve the end-effector position in real time. A focused engineering demonstration—not a decorative hero effect.</p>
        </div>

        <div className="grid overflow-hidden border border-black/15 bg-[#e8e4dc] lg:grid-cols-[1.35fr_0.65fr]">
          <div className="relative min-h-[430px] border-b border-black/10 p-4 lg:border-b-0 lg:border-r lg:p-8">
            <div className="mb-4 flex items-center justify-between">
              <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(0,0,0,0.52)",letterSpacing:"0.18em"}}>FK SOLVER / XY PLANE</span>
              <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(0,0,0,0.72)",letterSpacing:"0.1em"}}>X {ee.x.toFixed(1)} · Y {(300-ee.y).toFixed(1)}</span>
            </div>
            <svg viewBox="0 0 480 300" className="h-[350px] w-full" fill="none" aria-label="Interactive three joint robot arm">
              <defs><pattern id="kin-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" stroke="rgba(0,0,0,0.07)" strokeWidth=".6"/></pattern></defs>
              <rect width="480" height="300" fill="url(#kin-grid)"/>
              <path d="M28 252H452M122 270V28" stroke="rgba(0,0,0,0.13)" strokeDasharray="4 7"/>
              <path d={`M122 252 A244 244 0 0 1 366 8`} stroke="rgba(0,0,0,0.12)" strokeDasharray="5 9"/>
              <path d={`M${base.x} ${base.y}L${j2.x} ${j2.y}L${j3.x} ${j3.y}L${ee.x} ${ee.y}`} stroke="#111" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
              {[base,j2,j3].map((point,i)=><g key={i} transform={`translate(${point.x} ${point.y})`}><circle r={i===0?16:13} fill="#e8e4dc" stroke="#111" strokeWidth="1.4"/><circle r={4} fill="#111"/><circle r={i===0?10:8} stroke="rgba(0,0,0,0.3)"/></g>)}
              <g transform={`translate(${ee.x} ${ee.y})`}>
                <circle r="18" stroke="rgba(0,0,0,0.3)" strokeDasharray="2 5"/>
                <path d="M-12 0H12M0-12V12" stroke="#111"/>
                <circle r="3" fill="#111"/>
              </g>
              <text x="32" y="28" fill="rgba(0,0,0,0.42)" fontSize="8" fontFamily="DM Mono" letterSpacing="1.5">WORKSPACE ENVELOPE</text>
              <text x={ee.x+18} y={ee.y-12} fill="rgba(0,0,0,0.62)" fontSize="8" fontFamily="DM Mono">EE</text>
            </svg>
          </div>
          <div className="flex flex-col justify-between bg-[#111] p-7 text-white md:p-10">
            <div>
              <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.62)",letterSpacing:"0.18em"}}>JOINT CONTROL</span>
                <button onClick={()=>setAngles([34,58,-42])} style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.62)",letterSpacing:"0.12em",background:"transparent",border:0}}>RESET</button>
              </div>
              <div className="space-y-9">
                {angles.map((angle,i)=>(
                  <label key={i} className="block">
                    <span className="mb-3 flex items-center justify-between">
                      <span style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.7)",letterSpacing:"0.16em"}}>J{i+1} / {["BASE","ELBOW","WRIST"][i]}</span>
                      <span style={{fontFamily:BG,fontWeight:800,fontSize:"1.25rem"}}>{angle>0?"+":""}{angle}°</span>
                    </span>
                    <input aria-label={`Joint ${i+1} angle`} type="range" min={i===0?-10:-100} max={i===0?145:110} value={angle} onChange={event=>update(i,Number(event.target.value))} className="kin-range w-full"/>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 border-l border-t border-white/10">
              {[["X",ee.x-base.x],["Y",base.y-ee.y],["REACH",Math.hypot(ee.x-base.x,ee.y-base.y)],["DOF",3]].map(([label,value])=><div key={label as string} className="border-b border-r border-white/10 p-4"><div style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.42)",letterSpacing:"0.14em"}}>{label}</div><div className="mt-2" style={{fontFamily:BG,fontWeight:850,fontSize:"1.35rem"}}>{typeof value==="number"&&label!=="DOF"?value.toFixed(1):value}</div></div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── STATEMENT ──────────────────────────────────────────────────── */
function Statement() {
  const ref=useRef<HTMLElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start end","end start"]});
  const scale=useTransform(scrollYProgress,[0,0.4,0.6,1],[0.88,1,1,0.88]);
  const op=useTransform(scrollYProgress,[0,0.28,0.72,1],[0,1,1,0]);
  return (
    <section ref={ref} className="min-h-[82svh] py-32 flex items-center justify-center overflow-hidden border-b" style={{borderColor:BRD,position:"relative"}}>
      <CircuitBg opacity={0.038}/><HexDotBg opacity={0.026}/>
      <GearDecor size={320} teeth={22} speed={52} opacity={0.038} x="-5%" y="-18%"/>
      <GearDecor size={200} teeth={16} speed={36} opacity={0.04} x="83%" y="58%" reverse/>
      <HUDFrame label="ENGINEERING_PHILOSOPHY"/>
      <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 60% 50% at 50% 50%,rgba(255,255,255,0.016) 0%,transparent 100%)"}}/>
      <motion.div style={{scale,opacity:op}} className="px-6 md:px-14 text-center max-w-6xl">
        <div className="mb-12 flex items-center justify-center gap-3">
          <div style={{width:20,height:1,background:"rgba(255,255,255,0.14)"}}/>
          <TypeBot text="ENGINEERING PHILOSOPHY" delay={0.2} speed={28} style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.58)",letterSpacing:"0.35em"}}/>
          <div style={{width:20,height:1,background:"rgba(255,255,255,0.14)"}}/>
        </div>
        <h2 style={{fontFamily:BG,fontWeight:900,letterSpacing:"-0.046em",lineHeight:0.86,fontSize:"clamp(3rem,8.5vw,9rem)"}}>
          <WordReveal text="Automation only" delay={0} stagger={0.1}/><br className="hidden md:block"/>{" "}
          <WordReveal text="counts when it" delay={0.22} stagger={0.068}/><br className="hidden md:block"/>{" "}
          <WordReveal text="works every time," delay={0.46} stagger={0.068} color="rgba(255,255,255,0.58)"/><br className="hidden md:block"/>{" "}
          <WordReveal text="not just in demos." delay={0.7} stagger={0.068} color="rgba(255,255,255,0.58)"/>
        </h2>
        <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{delay:1.1,duration:1.2,ease:[0.22,1,0.36,1]}} className="mt-14 mx-auto origin-left" style={{width:72,height:1,background:"rgba(255,255,255,0.18)"}}/>
      </motion.div>
    </section>
  );
}

/* ─── ABOUT ──────────────────────────────────────────────────────── */
function About() {
  const ref=useRef<HTMLElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start end","end start"]});
  const imgY=useTransform(scrollYProgress,[0,1],[-80,80]);
  const numY=useTransform(scrollYProgress,[0,1],[60,-60]);
  const STATS=[{to:4,suf:"+",l:"Robot Platforms"},{to:2,suf:"×",l:"Industry Roles"},{to:3,suf:"+",l:"Vision Systems"},{to:4,suf:" yrs",l:"MSc · In Progress"}];
  return (
    <section ref={ref} id="about" data-theme="light" style={{background:LIGHT_BG,position:"relative"}}>
      <HexDotBg opacity={0.044} dark={false}/>
      <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"repeating-linear-gradient(45deg,rgba(0,0,0,0.016) 0px,rgba(0,0,0,0.016) 1px,transparent 1px,transparent 30px)"}}/>
      <HUDFrame label="02_ABOUT" dark={false}/>
      <GearDecor size={250} teeth={20} speed={44} opacity={0.05} dark={false} x="76%" y="5%"/>
      <GearDecor size={130} teeth={12} speed={28} opacity={0.044} dark={false} x="-2%" y="66%" reverse/>
      <motion.div style={{y:numY}} className="absolute right-0 top-0 pointer-events-none select-none overflow-hidden" aria-hidden>
        <span style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(12rem,30vw,26rem)",color:"rgba(0,0,0,0.036)",lineHeight:1,letterSpacing:"-0.055em"}}>02</span>
      </motion.div>
      <div className="relative px-6 md:px-14 py-36 max-w-screen-2xl mx-auto">
        <div className="flex justify-between items-baseline border-b pb-7 mb-20" style={{borderColor:"rgba(0,0,0,0.1)"}}>
          <TypeBot text="02 / ABOUT" delay={0.1} speed={28} style={{fontFamily:MN,fontSize:"11px",color:"rgba(0,0,0,0.62)",letterSpacing:"0.26em"}}/>
          <span className="hidden sm:block" style={{fontFamily:MN,fontSize:"10px",color:"rgba(0,0,0,0.52)",letterSpacing:"0.12em"}}>LEVERKUSEN · TU DORTMUND</span>
        </div>
        <div className="mb-24 max-w-6xl">
          <p style={{fontFamily:BG,fontWeight:900,letterSpacing:"-0.038em",fontSize:"clamp(2rem,5.2vw,4.8rem)",lineHeight:1.03,color:"#0a0a0a"}}>
            <WordReveal text="I build robots that" delay={0} stagger={0.07}/>{" "}
            <WordReveal text="see, decide," delay={0.22} stagger={0.065}/>{" "}
            <WordReveal text="and act — reliably." delay={0.46} stagger={0.06}/>
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l mb-24" style={{borderColor:"rgba(0,0,0,0.08)"}}>
          {STATS.map((s,i)=>(
            <motion.div key={s.l} initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07}} className="border-r border-b px-7 py-9" style={{borderColor:"rgba(0,0,0,0.08)"}}>
              <div style={{fontFamily:BG,fontWeight:900,fontSize:"3.8rem",lineHeight:1,color:"#0a0a0a"}}><Counter to={s.to} suffix={s.suf}/></div>
              <div style={{fontFamily:MN,fontSize:"10px",color:"rgba(0,0,0,0.62)",marginTop:"10px",letterSpacing:"0.12em",lineHeight:1.5}}>{s.l.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>
        <div className="grid gap-16 items-start lg:grid-cols-[1fr_400px]">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-12">
            {/* Lede paragraph — BG font, large */}
            <motion.p initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.9,ease:[0.22,1,0.36,1]}}
              style={{fontFamily:BG,fontWeight:600,fontSize:"clamp(1.18rem,2.2vw,1.62rem)",letterSpacing:"-0.018em",lineHeight:1.52,color:"#0a0a0a"}}>
              I take robots from concept to commissioning — building, configuring, and testing automated workflows that hold up in real industrial and laboratory environments.
            </motion.p>

            {/* Two supporting paras — DM Mono, tighter */}
            <div className="space-y-5">
              {["Proven track record integrating Universal Robots and Stäubli platforms with vision systems — SensoPart, Intel RealSense, CubeEye — into reliable automated workflows using Python, OpenCV, and Open3D.",
                "Skilled across the full lifecycle: feasibility analysis, software development, simulation validation, on-site commissioning, troubleshooting, and structured technical documentation for handover."
              ].map((t,i)=>(
                <motion.p key={i} initial={{opacity:0,clipPath:"inset(0 100% 0 0)"}} whileInView={{opacity:1,clipPath:"inset(0 0% 0 0)"}} viewport={{once:true}} transition={{delay:i*0.14,duration:1.1,ease:[0.22,1,0.36,1]}}
                  style={{fontFamily:MN,fontSize:"clamp(13px,1.25vw,15px)",color:"rgba(0,0,0,0.72)",lineHeight:1.85,maxWidth:"76ch"}}>{t}</motion.p>
              ))}
            </div>

            {/* Languages + social */}
            <div className="flex flex-col gap-8">
              {/* Languages */}
              <div>
                <div style={{fontFamily:MN,fontSize:"10px",color:"rgba(0,0,0,0.58)",letterSpacing:"0.22em",marginBottom:16}}>LANGUAGES</div>
                <div className="flex flex-col gap-4">
                  {[{l:"English",code:"EN",level:"C1",pct:88},{l:"Deutsch",code:"DE",level:"B1",pct:48}].map(({l,code,level,pct},i)=>(
                    <div key={l} className="flex items-center gap-4">
                      <span style={{fontFamily:MN,fontSize:"10px",color:"rgba(0,0,0,0.58)",letterSpacing:"0.14em",minWidth:24}}>{code}</span>
                      <div style={{flex:1,height:1,background:"rgba(0,0,0,0.08)",position:"relative",overflow:"hidden"}}>
                        <motion.div initial={{width:"0%"}} whileInView={{width:`${pct}%`}} viewport={{once:true}} transition={{delay:i*0.15+0.4,duration:1.1,ease:[0.22,1,0.36,1]}} style={{position:"absolute",top:0,left:0,height:"100%",background:"rgba(0,0,0,0.35)"}}/>
                      </div>
                      <span style={{fontFamily:BG,fontWeight:800,fontSize:"1rem",color:"#0a0a0a",letterSpacing:"-0.01em",minWidth:24}}>{level}</span>
                      <span style={{fontFamily:MN,fontSize:"10px",color:"rgba(0,0,0,0.58)",letterSpacing:"0.08em"}}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Social links */}
              <div className="flex gap-6">
                {[{I:Linkedin,l:"LinkedIn",href:"https://www.linkedin.com/in/alphin-francis"},{I:Mail,l:"Email",href:"mailto:alphinfrancis7@gmail.com"}].map(({I,l,href})=>(
                  <a key={l} href={href} className="flex items-center gap-2 transition-opacity hover:opacity-100" style={{fontFamily:MN,fontSize:"11px",color:"rgba(0,0,0,0.68)",letterSpacing:"0.08em",opacity:0.8,textDecoration:"none"}}><I size={13}/> {l}</a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column — photo + spec panel ── */}
          <div className="flex flex-col gap-0">
            <motion.div initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:1.0,ease:[0.22,1,0.36,1]}} className="relative overflow-hidden" style={{height:480,borderRadius:"2px 2px 0 0"}}>
              <motion.div style={{y:imgY,height:"128%",position:"relative"}}>
              <ImageWithFallback src={alphinPhoto} alt="Alphin Francis" className="w-full h-full object-cover object-top" style={{filter:"contrast(1.08) brightness(0.92)"}}/>
            </motion.div>
              <HUDFrame dark={false} sublabel="SUBJECT_001·2026"/>
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex justify-between" style={{borderTop:"1px solid rgba(0,0,0,0.1)"}}>
                <TypeBot text="A. FRANCIS · TU DORTMUND" delay={0.3} speed={30} style={{fontFamily:MN,fontSize:"9px",color:"rgba(0,0,0,0.55)",letterSpacing:"0.12em"}}/>
                <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(0,0,0,0.55)",letterSpacing:"0.12em"}}>LEVERKUSEN, DE</span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── TIMELINE ───────────────────────────────────────────────────── */
function Timeline() {
  return (
    <section id="experience" className="px-6 md:px-14 py-32 border-t" style={{borderColor:BRD,position:"relative"}}>
      <CircuitBg opacity={0.032}/>
      <GearDecor size={190} teeth={16} speed={38} opacity={0.042} x="88%" y="8%" reverse/>
      <HUDFrame label="03_EXPERIENCE"/>
      <div className="relative max-w-screen-xl mx-auto">
        <div className="flex justify-between items-baseline border-b pb-7 mb-20" style={{borderColor:BRD}}>
            <TypeBot text="03 / EXPERIENCE" delay={0.1} speed={28} style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.68)",letterSpacing:"0.26em"}}/>
        </div>
        {TIMELINE.map((item,i)=>(
          <motion.div key={item.year} initial={{opacity:0,y:36}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-12%"}} transition={{delay:i*0.09,duration:0.82,ease:[0.22,1,0.36,1]}} className="grid md:grid-cols-[110px_1fr] border-b" style={{borderColor:BRD}}>
            <div className="py-8 md:pr-10">
              <div style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(1.35rem,3vw,2.3rem)",lineHeight:1,color:"rgba(255,255,255,0.38)",letterSpacing:"-0.04em"}}>{item.year}</div>
            </div>
            <div className="pb-8 md:pt-8 md:pl-12 border-t md:border-t-0 md:border-l" style={{borderColor:BRD}}>
              <div className="mb-4 overflow-hidden">
                <motion.div initial={{y:"105%"}} whileInView={{y:"0%"}} viewport={{once:true,margin:"-15%"}} transition={{delay:i*0.08+0.14,duration:0.72,ease:[0.22,1,0.36,1]}}>
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <TypeBot text={item.role} delay={i*0.1+0.2} speed={36} style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(1.4rem,2.8vw,2.1rem)",letterSpacing:"-0.022em"}}/>
                    <span style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.66)",letterSpacing:"0.1em",border:"1px solid rgba(255,255,255,0.16)",padding:"4px 10px",borderRadius:99}}>{item.org}</span>
                  </div>
                </motion.div>
              </div>
              <motion.p initial={{opacity:0,clipPath:"inset(0 100% 0 0)"}} whileInView={{opacity:1,clipPath:"inset(0 0% 0 0)"}} viewport={{once:true}} transition={{delay:i*0.08+0.3,duration:1.0,ease:[0.22,1,0.36,1]}} style={{fontFamily:MN,fontSize:"11.5px",color:"rgba(255,255,255,0.68)",lineHeight:1.9,maxWidth:"92ch"}}>{item.detail}</motion.p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── SKILLS ─────────────────────────────────────────────────────── */
function Skills() {
  return (
    <section id="skills" className="px-6 md:px-14 py-32 border-t" style={{borderColor:BRD,position:"relative"}}>
      <CircuitBg opacity={0.036}/><HexDotBg opacity={0.024}/>
      <HUDFrame label="04_SKILLS"/>
      <GearDecor size={240} teeth={20} speed={42} opacity={0.04} x="-4%" y="58%"/>
      <div className="relative">
        <div className="flex justify-between items-baseline border-b pb-7 mb-20" style={{borderColor:BRD}}>
          <TypeBot text="04 / SKILLS & STACK" delay={0.1} speed={28} style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.68)",letterSpacing:"0.26em"}}/>
          <TypeBot text="ENGINEERING DOMAINS" delay={0.4} speed={25} style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.54)",letterSpacing:"0.12em"}}/>
        </div>
        <div className="grid md:grid-cols-[280px_1fr] gap-16 items-start">
          <motion.div initial={{opacity:0,scale:0.9}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{duration:1.0,ease:[0.22,1,0.36,1]}}>
            <SkillRadar/>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l" style={{borderColor:BRD}}>
            {SKILLS_DOMAINS.map((row,ri)=>(
              <motion.div key={row.label} initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:ri*0.08,duration:0.78,ease:[0.22,1,0.36,1]}}
                className="border-r border-b transition-colors duration-300" style={{borderColor:BRD}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.02)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>
                <div className="px-7 pt-7 pb-4 flex items-center gap-3" style={{borderBottom:`1px solid ${BRD}`}}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{opacity:0.3}}><circle cx="5" cy="5" r="4" stroke="white" strokeWidth="0.8"/><circle cx="5" cy="5" r="2" stroke="white" strokeWidth="0.7"/></svg>
                  <TypeBot text={row.label.toUpperCase()} delay={ri*0.08} speed={30} style={{fontFamily:MN,fontSize:"9.5px",color:"rgba(255,255,255,0.62)",letterSpacing:"0.28em"}}/>
                </div>
                <div className="px-7 py-6 flex flex-wrap gap-2.5">
                  {row.items.map((s,si)=>(
                    <motion.span key={s} initial={{opacity:0,scale:0.9}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:ri*0.06+si*0.04}}
                      style={{fontFamily:BG,fontWeight:700,fontSize:"clamp(0.88rem,1.7vw,1.25rem)",letterSpacing:"-0.014em",border:`1px solid ${BRD}`,padding:"6px 14px",borderRadius:2,display:"inline-block"}}>{s}</motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── AUTOMATION LOOP ────────────────────────────────────────────── */
function SystemsLab() {
  return (
    <section className="relative overflow-hidden border-t px-6 py-32 md:px-14" style={{borderColor:BRD}}>
      <CircuitBg opacity={0.028}/>
      <HUDFrame label="05_AUTOMATION_LOOP" sublabel="PERCEPTION_TO_DEPLOYMENT"/>
      <motion.div
        className="absolute left-0 right-0 top-0 h-px"
        style={{background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)"}}
        animate={{x:["-100%","100%"]}}
        transition={{duration:5,repeat:Infinity,repeatDelay:4,ease:"linear"}}
      />
      <div className="relative mx-auto max-w-screen-xl">
        <div className="mb-16 grid gap-8 border-b pb-8 md:grid-cols-[1fr_1.2fr] md:items-end" style={{borderColor:BRD}}>
          <div>
            <TypeBot text="05 / AUTOMATION LOOP" speed={28} style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.7)",letterSpacing:"0.26em"}}/>
            <h2 className="mt-6" style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(3rem,7vw,7rem)",letterSpacing:"-0.05em",lineHeight:0.84}}>
              FROM SENSOR<br/><span style={{color:"rgba(255,255,255,0.42)"}}>TO SYSTEM.</span>
            </h2>
          </div>
          <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.8}}
            style={{fontFamily:MN,fontSize:"11px",color:"rgba(255,255,255,0.68)",lineHeight:1.95,maxWidth:"58ch"}}>
            I work across the complete automation lifecycle. The interface below visualizes how I turn raw sensor data into simulated robot behavior, then a commissioned and documented workflow.
          </motion.p>
        </div>

        <div className="grid border-l border-t lg:grid-cols-3" style={{borderColor:BRD}}>
          {AUTOMATION_PHASES.map((project,i)=>(
            <motion.article
              key={project.id}
              initial={{opacity:0,y:34}}
              whileInView={{opacity:1,y:0}}
              viewport={{once:true,margin:"-10%"}}
              transition={{delay:i*0.1,duration:0.8,ease:[0.22,1,0.36,1]}}
              whileHover={{backgroundColor:"rgba(255,255,255,0.035)"}}
              className="group relative min-h-[360px] overflow-hidden border-b border-r p-7 md:p-9"
              style={{borderColor:BRD}}
            >
              <motion.div className="absolute left-0 top-0 h-px bg-white" initial={{width:"0%"}} whileInView={{width:"100%"}} viewport={{once:true}} transition={{delay:0.35+i*0.12,duration:1.2}}/>
              <span style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.58)",letterSpacing:"0.2em"}}>{project.id}</span>
              <div className="my-10 h-20">
                <svg viewBox="0 0 260 80" className="h-full w-full overflow-visible" fill="none" aria-hidden="true">
                  <path d="M0 58 H42 L58 22 H91 L108 58 H145 L160 35 H201 L216 58 H260" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
                  <motion.path d="M0 58 H42 L58 22 H91 L108 58 H145 L160 35 H201 L216 58 H260" stroke="rgba(255,255,255,0.48)" strokeWidth="1.2" strokeDasharray="24 236" animate={{strokeDashoffset:[260,0]}} transition={{duration:3.4,repeat:Infinity,ease:"linear",delay:i*0.45}}/>
                  {[42,58,91,108,145,160,201,216].map((x,n)=><circle key={x} cx={x} cy={[58,22,22,58,58,35,35,58][n]} r="2.3" fill={n%3===i?"rgba(255,255,255,0.72)":"rgba(255,255,255,0.24)"}/>)}
                </svg>
              </div>
              <h3 style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(1.7rem,3vw,2.6rem)",letterSpacing:"-0.035em",lineHeight:0.95}}>{project.title}</h3>
              <div className="mt-4" style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.62)",letterSpacing:"0.1em",lineHeight:1.7}}>{project.meta}</div>
              <p className="mt-7" style={{fontFamily:MN,fontSize:"10.5px",color:"rgba(255,255,255,0.68)",lineHeight:1.9}}>{project.body}</p>
              <ArrowUpRight size={18} className="absolute bottom-7 right-7 text-white/30 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"/>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CONTACT FORM ───────────────────────────────────────────────── */
function ContactForm() {
  const [form,setForm]=useState({name:"",email:"",type:"",message:""});
  const [status,setStatus]=useState<"idle"|"sending"|"sent">("idle");
  const [focused,setFocused]=useState("");
  const types=["FULL-TIME ROLE","RESEARCH COLLAB","CONSULTING","SPEAKING / DEMO","OPEN SOURCE"];
  const handleSubmit=(e:React.FormEvent)=>{e.preventDefault();if(!form.name||!form.email)return;setStatus("sending");setTimeout(()=>setStatus("sent"),2400);};
  const fieldStyle=(f:string):React.CSSProperties=>({display:"block",width:"100%",background:"transparent",fontFamily:MN,fontSize:"14px",color:"#fff",outline:"none",padding:"13px 0 9px",borderBottom:`1px solid ${focused===f?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.22)"}`,transition:"border-color .25s",letterSpacing:"0.03em"});
  const lbl:React.CSSProperties={fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.68)",letterSpacing:"0.2em",display:"block",marginBottom:4};
  return (
    <motion.div initial={{opacity:0,y:38}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.9,ease:[0.22,1,0.36,1]}} style={{border:`1px solid ${BRD}`,position:"relative",overflow:"hidden"}}>
      <div className="flex items-center justify-between px-5 py-3" style={{borderBottom:`1px solid ${BRD}`,background:"rgba(255,255,255,0.016)"}}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:`rgba(255,255,255,${0.08+i*0.04})`}}/>)}</div>
          <span style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.62)",letterSpacing:"0.18em"}}>CONTACT REQUEST</span>
        </div>
        <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.42)",letterSpacing:"0.14em"}}>SECURE FORM</span>
      </div>
      <motion.div style={{position:"absolute",left:0,right:0,height:1,background:"linear-gradient(to right,transparent,rgba(255,255,255,0.08),transparent)",pointerEvents:"none",zIndex:10}} animate={{top:["8%","96%"]}} transition={{duration:5,repeat:Infinity,repeatDelay:8,ease:"linear"}}/>
      <AnimatePresence mode="wait">
        {status==="sent"?(
          <motion.div key="sent" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="flex flex-col items-center justify-center py-20 px-8 gap-6">
            <div style={{width:52,height:52,border:`1px solid rgba(255,255,255,0.18)`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="20" height="15" fill="none" viewBox="0 0 20 15"><path d="M1 7.5 L7 13.5 L19 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="text-center">
              <TypeBot text="TRANSMISSION RECEIVED" speed={30} style={{fontFamily:MN,fontSize:"13px",color:"rgba(255,255,255,0.86)",letterSpacing:"0.18em",display:"block",marginBottom:8}}/>
              <TypeBot text="RESPONSE QUEUED · ETA 24h" delay={1.0} speed={28} style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.62)",letterSpacing:"0.14em"}}/>
            </div>
          </motion.div>
        ):(
          <motion.form key="form" onSubmit={handleSubmit} exit={{opacity:0}} className="p-6 md:p-8 space-y-7">
            <div style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",marginBottom:2}}>
              <span style={{color:"rgba(255,255,255,0.3)"}}>$</span> ./initiate_contact.sh --secure --priority=HIGH
            </div>
            <div className="grid md:grid-cols-2 gap-7">
              <div><label style={lbl}>PARAM: NAME *</label><input required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} onFocus={()=>setFocused("name")} onBlur={()=>setFocused("")} style={fieldStyle("name")} placeholder="—"/></div>
              <div><label style={lbl}>PARAM: EMAIL *</label><input required type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} onFocus={()=>setFocused("email")} onBlur={()=>setFocused("")} style={fieldStyle("email")} placeholder="—"/></div>
            </div>
            <div>
              <label style={lbl}>PARAM: SUBJECT_TYPE</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {types.map(t=>(
                  <button key={t} type="button" onClick={()=>setForm(p=>({...p,type:t}))} style={{fontFamily:MN,fontSize:"9.5px",letterSpacing:"0.1em",padding:"8px 13px",border:`1px solid ${form.type===t?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.18)"}`,color:form.type===t?"#fff":"rgba(255,255,255,0.66)",background:form.type===t?"rgba(255,255,255,0.1)":"transparent",transition:"all .2s",cursor:"none"}}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>PARAM: MESSAGE</label>
              <textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} onFocus={()=>setFocused("msg")} onBlur={()=>setFocused("")} rows={4} style={{display:"block",width:"100%",background:"rgba(255,255,255,0.025)",fontFamily:MN,fontSize:"14px",color:"#fff",outline:"none",resize:"none",padding:"14px",border:`1px solid ${focused==="msg"?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.2)"}`,transition:"border-color .25s",letterSpacing:"0.02em",lineHeight:1.7}} placeholder="Describe your project or inquiry..."/>
            </div>
            <div className="flex items-center justify-between pt-2" style={{borderTop:`1px solid ${BRD}`}}>
              <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em"}}>DIRECT INQUIRY</span>
              <motion.button type="submit" whileHover={{scale:1.02}} whileTap={{scale:0.97}} disabled={status==="sending"} className="flex items-center gap-2" style={{fontFamily:MN,fontSize:"11px",letterSpacing:"0.15em",border:`1px solid ${status==="sending"?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.5)"}`,color:status==="sending"?"rgba(255,255,255,0.5)":"#fff",padding:"12px 24px",background:status==="sending"?"transparent":"rgba(255,255,255,0.08)",transition:"all .25s",cursor:"none"}}>
                {status==="sending"?<><span style={{animation:"termBlink 0.4s step-end infinite"}}>█</span> TRANSMITTING...</>:<><span style={{opacity:0.4}}>→</span> TRANSMIT<ArrowUpRight size={10}/></>}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── CONTACT ────────────────────────────────────────────────────── */
function Contact() {
  const ref=useRef<HTMLElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start end","end end"]});
  const y=useTransform(scrollYProgress,[0,1],[80,0]);
  const op=useTransform(scrollYProgress,[0,0.4],[0,1]);
  return (
    <section ref={ref} id="contact" className="px-6 md:px-14 pt-36 pb-28 border-t" style={{borderColor:BRD,position:"relative"}}>
      <CircuitBg opacity={0.033}/><HexDotBg opacity={0.022}/>
      <HUDFrame label="06_CONTACT"/>
      <GearDecor size={280} teeth={22} speed={50} opacity={0.04} x="68%" y="-8%"/>
      <GearDecor size={150} teeth={14} speed={30} opacity={0.038} x="-3%" y="58%" reverse/>
      <div className="absolute right-6 top-16 pointer-events-none select-none" aria-hidden>
        <span style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(8rem,22vw,18rem)",color:"rgba(255,255,255,0.035)",lineHeight:1,letterSpacing:"-0.055em"}}>06</span>
      </div>
      <div className="relative max-w-screen-xl mx-auto">
        <TypeBot text="06 / CONTACT" delay={0.1} speed={28} style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.64)",letterSpacing:"0.32em",display:"block",marginBottom:"3.5rem"}}/>
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-16 md:gap-20 items-start">
          <motion.div style={{y,opacity:op}}>
            <h2 style={{fontFamily:BG,fontWeight:900,letterSpacing:"-0.048em",lineHeight:0.86,fontSize:"clamp(2.5rem,7vw,7rem)",marginBottom:"2rem"}}>
              <WordReveal text="Let's build" delay={0}/><br/>
              <WordReveal text="something" delay={0.12}/><br/>
              <WordReveal text="that moves." delay={0.24} color="rgba(255,255,255,0.58)"/>
            </h2>
            <motion.p initial={{opacity:0,clipPath:"inset(0 100% 0 0)"}} whileInView={{opacity:1,clipPath:"inset(0 0% 0 0)"}} viewport={{once:true}} transition={{duration:1.1,ease:[0.22,1,0.36,1],delay:0.3}} style={{fontFamily:MN,fontSize:"13px",color:"rgba(255,255,255,0.78)",lineHeight:1.9,maxWidth:"44ch",marginBottom:"2.5rem"}}>
              I'm open to full-time roles, research collaborations, and consulting in robotics and automation. I'm always happy to talk mobile manipulators, vision-guided systems, or the best coffee in Leverkusen.
            </motion.p>
            <div className="flex flex-col gap-3.5">
              {[{I:Mail,label:"EMAIL",t:"alphinfrancis7@gmail.com",href:"mailto:alphinfrancis7@gmail.com"},{I:ExternalLink,label:"PHONE",t:"+49 176 43244722",href:"tel:+4917643244722"},{I:Linkedin,label:"LINKEDIN",t:"linkedin.com/in/alphin-francis",href:"https://www.linkedin.com/in/alphin-francis"}].map(({I,label,t,href})=>(
                <Mag key={t} str={0.1}>
                  <a href={href} className="group flex items-center gap-3" style={{textDecoration:"none"}}>
                    <div style={{width:34,height:34,border:"1px solid rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.62)",transition:"all .22s",flexShrink:0}} className="group-hover:border-white/50 group-hover:text-white"><I size={14}/></div>
                    <div>
                      <div style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.58)",letterSpacing:"0.18em",marginBottom:3}}>{label}</div>
                      <div style={{fontFamily:MN,fontSize:"12px",color:"rgba(255,255,255,0.86)",letterSpacing:"0.04em",transition:"color .22s"}} className="group-hover:text-white">{t}</div>
                    </div>
                    <ArrowUpRight size={11} style={{color:"rgba(255,255,255,0.15)",marginLeft:"auto"}} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </a>
                </Mag>
              ))}
            </div>
          </motion.div>
          <ContactForm/>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────────── */
function FooterArmCanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    const staticMode=window.matchMedia("(max-width: 767px), (prefers-reduced-motion: reduce)").matches;
    let raf:number,T=0;
    const trail:[number,number][]=[];
    const draw=()=>{
      const W=canvas.width,H=canvas.height;
      ctx.clearRect(0,0,W,H);
      // engineering grid
      ctx.strokeStyle="rgba(0,0,0,0.05)";ctx.lineWidth=0.5;
      for(let x=0;x<W;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      T+=0.01;
      // forward kinematics
      const base={x:110,y:H-28};const L1=82,L2=66,L3=38;
      const a1=Math.sin(T*0.65)*0.44+1.08;
      const a12=a1+Math.sin(T*1.15+1.2)*0.58-0.1;
      const a123=a12+Math.sin(T*0.9+2.5)*0.46;
      const j2={x:base.x+Math.cos(a1)*L1,y:base.y-Math.sin(a1)*L1};
      const j3={x:j2.x+Math.cos(a12)*L2,y:j2.y-Math.sin(a12)*L2};
      const ee={x:j3.x+Math.cos(a123)*L3,y:j3.y-Math.sin(a123)*L3};
      trail.push([ee.x,ee.y]);if(trail.length>100)trail.shift();
      // EE trail
      for(let i=1;i<trail.length;i++){
        const p=i/trail.length;
        ctx.strokeStyle=`rgba(0,0,0,${p*0.14})`;
        ctx.lineWidth=p*1.8;ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(trail[i-1][0],trail[i-1][1]);ctx.lineTo(trail[i][0],trail[i][1]);ctx.stroke();
      }
      // workspace arc
      ctx.strokeStyle="rgba(0,0,0,0.055)";ctx.lineWidth=0.8;
      ctx.setLineDash([4,8]);ctx.beginPath();
      ctx.arc(base.x,base.y,L1+L2+L3-8,Math.PI*1.82,Math.PI*0.08);ctx.stroke();
      ctx.setLineDash([]);
      // link draw
      const lnk=(a:{x:number,y:number},b:{x:number,y:number},w:number,al:number)=>{
        ctx.lineCap="round";
        ctx.strokeStyle=`rgba(0,0,0,${al*0.13})`;ctx.lineWidth=w+5;
        ctx.beginPath();ctx.moveTo(a.x+2,a.y+2);ctx.lineTo(b.x+2,b.y+2);ctx.stroke();
        ctx.strokeStyle=`rgba(0,0,0,${al})`;ctx.lineWidth=w;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      };
      lnk(base,j2,7,0.28);lnk(j2,j3,5.5,0.22);lnk(j3,ee,4,0.17);
      // joint draw
      const jnt=(p:{x:number,y:number},r:number,al:number)=>{
        ctx.beginPath();ctx.arc(p.x+1,p.y+1,r,0,Math.PI*2);ctx.fillStyle=`rgba(0,0,0,${al*0.08})`;ctx.fill();
        ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle="#fff";ctx.fill();
        ctx.strokeStyle=`rgba(0,0,0,${al})`;ctx.lineWidth=1.5;ctx.stroke();
        ctx.beginPath();ctx.arc(p.x,p.y,r*0.58,0,Math.PI*2);ctx.strokeStyle=`rgba(0,0,0,${al*0.38})`;ctx.lineWidth=0.8;ctx.stroke();
        ctx.beginPath();ctx.arc(p.x,p.y,r*0.22,0,Math.PI*2);ctx.fillStyle=`rgba(0,0,0,${al*0.75})`;ctx.fill();
        for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2+Math.PI/4;ctx.beginPath();ctx.arc(p.x+Math.cos(a)*r*0.72,p.y+Math.sin(a)*r*0.72,1.5,0,Math.PI*2);ctx.fillStyle=`rgba(0,0,0,${al*0.28})`;ctx.fill();}
      };
      jnt(base,13,0.55);jnt(j2,10,0.48);jnt(j3,8,0.4);
      // end effector gripper
      ctx.save();ctx.translate(ee.x,ee.y);ctx.rotate(-a123);
      ctx.fillStyle="#fff";ctx.strokeStyle="rgba(0,0,0,0.35)";ctx.lineWidth=1;
      ctx.beginPath();ctx.rect(-5,-9,10,10);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.rect(-7,-16,4,9);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.rect(3,-16,4,9);ctx.fill();ctx.stroke();
      ctx.restore();
      // targeting crosshair
      const ch=11;
      ctx.strokeStyle="rgba(0,0,0,0.22)";ctx.lineWidth=0.9;
      ctx.beginPath();
      ctx.moveTo(ee.x-ch,ee.y);ctx.lineTo(ee.x-4,ee.y);
      ctx.moveTo(ee.x+4,ee.y);ctx.lineTo(ee.x+ch,ee.y);
      ctx.moveTo(ee.x,ee.y-ch);ctx.lineTo(ee.x,ee.y-4);
      ctx.moveTo(ee.x,ee.y+4);ctx.lineTo(ee.x,ee.y+ch);ctx.stroke();
      const cm=5;
      ctx.beginPath();
      ctx.moveTo(ee.x-ch,ee.y-ch+cm);ctx.lineTo(ee.x-ch,ee.y-ch);ctx.lineTo(ee.x-ch+cm,ee.y-ch);
      ctx.moveTo(ee.x+ch,ee.y-ch+cm);ctx.lineTo(ee.x+ch,ee.y-ch);ctx.lineTo(ee.x+ch-cm,ee.y-ch);
      ctx.moveTo(ee.x-ch,ee.y+ch-cm);ctx.lineTo(ee.x-ch,ee.y+ch);ctx.lineTo(ee.x-ch+cm,ee.y+ch);
      ctx.moveTo(ee.x+ch,ee.y+ch-cm);ctx.lineTo(ee.x+ch,ee.y+ch);ctx.lineTo(ee.x+ch-cm,ee.y+ch);ctx.stroke();
      // base platform
      ctx.fillStyle="rgba(0,0,0,0.12)";ctx.fillRect(base.x-18,base.y+6,36,8);
      ctx.fillStyle="rgba(0,0,0,0.2)";ctx.fillRect(base.x-12,base.y+2,24,6);
      // angle readouts
      ctx.font="7px 'DM Mono', monospace";ctx.fillStyle="rgba(0,0,0,0.28)";ctx.textAlign="left";
      const deg=(r:number)=>(r*180/Math.PI).toFixed(1)+"°";
      ctx.fillText("J1 "+deg(a1),base.x+18,base.y-8);
      ctx.fillText("J2 "+deg(a12-a1),j2.x+12,j2.y-5);
      ctx.fillText("J3 "+deg(a123-a12),j3.x+10,j3.y-5);
      // dimension line
      const ly=H-9;
      ctx.strokeStyle="rgba(0,0,0,0.1)";ctx.lineWidth=0.7;
      ctx.beginPath();ctx.moveTo(14,ly);ctx.lineTo(W-14,ly);ctx.moveTo(14,ly-3);ctx.lineTo(14,ly+3);ctx.moveTo(W-14,ly-3);ctx.lineTo(W-14,ly+3);ctx.stroke();
      ctx.font="6px 'DM Mono', monospace";ctx.fillStyle="rgba(0,0,0,0.2)";ctx.textAlign="center";
      ctx.fillText("840mm REACH · 6-DOF · ISO 9283",W/2,ly+9);
      if(!staticMode)raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={340} height={260} style={{width:"min(340px,100%)",height:"auto",aspectRatio:"340 / 260",display:"block"}}/>;
}

function _FooterArmSVGUnused() {
  return (
    <svg viewBox="0 0 520 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",maxWidth:520}}>
      {[0,1,2,3,4,5,6,7,8].map(i=><line key={`h${i}`} x1="0" y1={i*30} x2="520" y2={i*30} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>)}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(i=><line key={`v${i}`} x1={i*32} y1="0" x2={i*32} y2="240" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>)}

      {/* Base platform */}
      <rect x="60" y="200" width="84" height="12" rx="1" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="rgba(255,255,255,0.04)"/>
      <rect x="72" y="190" width="60" height="12" rx="1" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="rgba(255,255,255,0.03)"/>
      {/* Base bolts */}
      {[76,80,140,144,148].map((x,i)=><circle key={i} cx={x} cy={206} r="1.8" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>)}
      {/* Base label */}
      <text x="72" y="225" style={{fontFamily:"DM Mono, monospace",fontSize:6,fill:"rgba(255,255,255,0.3)",letterSpacing:"0.2em"}}>BASE</text>

      {/* Joint 1 — waist */}
      <circle cx="102" cy="184" r="10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" fill="rgba(255,255,255,0.06)"/>
      <circle cx="102" cy="184" r="5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
      <circle cx="102" cy="184" r="2" fill="rgba(255,255,255,0.5)"/>
      {[0,90,180,270].map(a=>{const r=a*Math.PI/180;return<circle key={a} cx={102+Math.cos(r)*7} cy={184+Math.sin(r)*7} r="1.5" fill="rgba(255,255,255,0.3)"/>;}) }
      <text x="116" y="178" style={{fontFamily:"DM Mono, monospace",fontSize:6,fill:"rgba(255,255,255,0.4)",letterSpacing:"0.15em"}}>J1 · 0°</text>

      {/* Link 1 — upper arm */}
      <rect x="97" y="130" width="10" height="54" rx="2" stroke="rgba(255,255,255,0.28)" strokeWidth="1.1" fill="rgba(255,255,255,0.04)"/>
      <line x1="102" y1="135" x2="102" y2="175" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" strokeDasharray="3 4"/>
      {/* Dimension arrows for Link 1 */}
      <line x1="54" y1="130" x2="54" y2="184" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7"/>
      <line x1="51" y1="130" x2="57" y2="130" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7"/>
      <line x1="51" y1="184" x2="57" y2="184" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7"/>
      <text x="30" y="160" style={{fontFamily:"DM Mono, monospace",fontSize:6,fill:"rgba(255,255,255,0.3)",letterSpacing:"0.08em"}}>260mm</text>

      {/* Joint 2 — shoulder */}
      <circle cx="102" cy="122" r="12" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="rgba(255,255,255,0.07)"/>
      <circle cx="102" cy="122" r="6" stroke="rgba(255,255,255,0.28)" strokeWidth="0.9"/>
      <circle cx="102" cy="122" r="2.5" fill="rgba(255,255,255,0.55)"/>
      {[0,90,180,270].map(a=>{const r=a*Math.PI/180;return<circle key={a} cx={102+Math.cos(r)*8.5} cy={122+Math.sin(r)*8.5} r="2" fill="rgba(255,255,255,0.3)"/>;}) }
      <text x="118" y="116" style={{fontFamily:"DM Mono, monospace",fontSize:6,fill:"rgba(255,255,255,0.4)",letterSpacing:"0.15em"}}>J2 · +47°</text>

      {/* Link 2 — forearm (angled) */}
      <g transform="rotate(-42,102,110)">
        <rect x="97" y="70" width="10" height="52" rx="2" stroke="rgba(255,255,255,0.26)" strokeWidth="1.1" fill="rgba(255,255,255,0.04)"/>
        <line x1="102" y1="75" x2="102" y2="115" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" strokeDasharray="3 4"/>
      </g>
      <text x="148" y="85" style={{fontFamily:"DM Mono, monospace",fontSize:6,fill:"rgba(255,255,255,0.28)",letterSpacing:"0.08em"}}>220mm</text>

      {/* Joint 3 — elbow */}
      <circle cx="140" cy="70" r="10" stroke="rgba(255,255,255,0.48)" strokeWidth="1.3" fill="rgba(255,255,255,0.06)"/>
      <circle cx="140" cy="70" r="5" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8"/>
      <circle cx="140" cy="70" r="2" fill="rgba(255,255,255,0.48)"/>
      {[0,90,180,270].map(a=>{const r=a*Math.PI/180;return<circle key={a} cx={140+Math.cos(r)*7} cy={70+Math.sin(r)*7} r="1.5" fill="rgba(255,255,255,0.28)"/>;}) }
      <text x="154" y="64" style={{fontFamily:"DM Mono, monospace",fontSize:6,fill:"rgba(255,255,255,0.4)",letterSpacing:"0.15em"}}>J3 · -26°</text>

      {/* Link 3 — wrist link */}
      <rect x="138" y="40" width="8" height="32" rx="1.5" stroke="rgba(255,255,255,0.24)" strokeWidth="1" fill="rgba(255,255,255,0.04)"/>

      {/* Joint 4 — wrist */}
      <circle cx="142" cy="34" r="8" stroke="rgba(255,255,255,0.42)" strokeWidth="1.2" fill="rgba(255,255,255,0.05)"/>
      <circle cx="142" cy="34" r="4" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7"/>
      <circle cx="142" cy="34" r="1.8" fill="rgba(255,255,255,0.42)"/>
      <text x="154" y="30" style={{fontFamily:"DM Mono, monospace",fontSize:6,fill:"rgba(255,255,255,0.38)",letterSpacing:"0.15em"}}>J4 · +14°</text>

      {/* End effector / gripper */}
      <g transform="rotate(12,142,20)">
        <rect x="136" y="8" width="12" height="18" rx="2" stroke="rgba(255,255,255,0.38)" strokeWidth="1" fill="rgba(255,255,255,0.05)"/>
        {/* Gripper fingers */}
        <rect x="133" y="6" width="4" height="10" rx="1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.9" fill="rgba(255,255,255,0.04)"/>
        <rect x="147" y="6" width="4" height="10" rx="1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.9" fill="rgba(255,255,255,0.04)"/>
        <line x1="135" y1="12" x2="140" y2="16" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
        <line x1="149" y1="12" x2="144" y2="16" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
      </g>
      <text x="162" y="14" style={{fontFamily:"DM Mono, monospace",fontSize:6,fill:"rgba(255,255,255,0.4)",letterSpacing:"0.12em"}}>EE</text>

      {/* DH frame axes at base */}
      <line x1="102" y1="184" x2="102" y2="162" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" markerEnd="url(#arr)"/>
      <line x1="102" y1="184" x2="124" y2="184" stroke="rgba(255,255,255,0.35)" strokeWidth="1.1"/>
      <text x="104" y="160" style={{fontFamily:"DM Mono, monospace",fontSize:5.5,fill:"rgba(255,255,255,0.45)",letterSpacing:"0.05em"}}>z₀</text>
      <text x="126" y="188" style={{fontFamily:"DM Mono, monospace",fontSize:5.5,fill:"rgba(255,255,255,0.35)",letterSpacing:"0.05em"}}>x₀</text>

      {/* DH parameter table */}
      <rect x="270" y="30" width="230" height="180" rx="2" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" fill="rgba(255,255,255,0.015)"/>
      {/* Table header */}
      <rect x="270" y="30" width="230" height="18" rx="2" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" fill="rgba(255,255,255,0.05)"/>
      <text x="278" y="42" style={{fontFamily:"DM Mono, monospace",fontSize:6.5,fill:"rgba(255,255,255,0.55)",letterSpacing:"0.18em"}}>DH PARAMETER TABLE</text>
      {/* Column headers */}
      {["JOINT","θ (deg)","d (mm)","a (mm)","α (deg)"].map((h,i)=>(
        <text key={h} x={278+i*44} y={60} style={{fontFamily:"DM Mono, monospace",fontSize:5.5,fill:"rgba(255,255,255,0.32)",letterSpacing:"0.1em"}}>{h}</text>
      ))}
      <line x1="270" y1="64" x2="500" y2="64" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6"/>
      {/* DH rows */}
      {[
        ["J1","0","78","0","90"],
        ["J2","+47","0","260","0"],
        ["J3","-26","0","220","0"],
        ["J4","+14","0","0","90"],
        ["J5","0","80","0","-90"],
        ["J6","0","28","0","0"],
      ].map(([j,t,d,a,al],i)=>(
        <g key={j}>
          <rect x="270" y={66+i*22} width="230" height="22" fill={i%2===0?"rgba(255,255,255,0.015)":"transparent"}/>
          {[j,t,d,a,al].map((v,ci)=>(
            <text key={ci} x={278+ci*44} y={80+i*22} style={{fontFamily:"DM Mono, monospace",fontSize:6.5,fill:ci===0?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.42)",letterSpacing:"0.08em"}}>{v}</text>
          ))}
        </g>
      ))}
      <line x1="270" y1="198" x2="500" y2="198" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6"/>
      <text x="278" y="208" style={{fontFamily:"DM Mono, monospace",fontSize:5.5,fill:"rgba(255,255,255,0.22)",letterSpacing:"0.1em"}}>MODIFIED DH CONVENTION — CRAIG 2005</text>

      {/* Arrowhead marker */}
      <defs>
        <marker id="arr" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <path d="M0,0 L0,4 L4,2 z" fill="rgba(255,255,255,0.5)"/>
        </marker>
      </defs>
    </svg>
  );
}

function Footer() {
  const navLinks=["Work","About","Skills","Contact"];
  const socials=[{I:Linkedin,l:"LinkedIn",href:"https://www.linkedin.com/in/alphin-francis"},{I:Mail,l:"alphinfrancis7@gmail.com",href:"mailto:alphinfrancis7@gmail.com"},{I:ExternalLink,l:"+49 176 43244722",href:"tel:+4917643244722"}];
  return (
    <footer id="site-footer" className="relative" style={{background:"#fff",borderTop:"1px solid rgba(0,0,0,0.1)"}}>

      {/* ── Main body */}
      <div className="px-6 md:px-12 pt-16 pb-8 max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 mb-16">

          {/* Brand block with animated arm */}
          <div className="flex-1 min-w-0">
            <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.8,ease:[0.22,1,0.36,1]}}>
              <h2 style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(3rem,6.5vw,6rem)",letterSpacing:"-0.05em",lineHeight:0.82,color:"#0a0a0a"}}>ALPHIN<br/>FRANCIS</h2>
              <p style={{fontFamily:MN,fontSize:"12px",color:"rgba(0,0,0,0.58)",marginTop:"1.4rem",letterSpacing:"0.12em",lineHeight:1.8}}>ROBOTICS & AUTOMATION ENGINEER<br/>LEVERKUSEN, GERMANY</p>
              <div className="flex items-center gap-2 mt-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{background:"rgba(0,0,0,0.18)"}}/>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{background:"rgba(0,0,0,0.7)"}}/>
                </span>
                <span style={{fontFamily:MN,fontSize:"10px",color:"rgba(0,0,0,0.52)",letterSpacing:"0.16em"}}>OPEN TO OPPORTUNITIES</span>
              </div>
            </motion.div>

            {/* Socials */}
            <div className="flex gap-3 mt-10">
              {socials.map(({I,href},i)=>(
                <motion.a key={i} href={href} whileHover={{scale:1.06}} whileTap={{scale:0.96}}
                  style={{width:40,height:40,border:"1px solid rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(0,0,0,0.5)",textDecoration:"none",transition:"border-color .2s,color .2s"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="#0a0a0a";(e.currentTarget as HTMLElement).style.color="#0a0a0a";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(0,0,0,0.15)";(e.currentTarget as HTMLElement).style.color="rgba(0,0,0,0.5)";}}>
                  <I size={15}/>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Canvas arm */}
          <div className="hidden md:flex flex-col items-center justify-center" style={{borderLeft:"1px solid rgba(0,0,0,0.07)",borderRight:"1px solid rgba(0,0,0,0.07)",padding:"0 32px"}}>
            <FooterArmCanvas/>
          </div>

          {/* Links */}
          <div>
            <div>
              <div style={{fontFamily:MN,fontSize:"9.5px",color:"rgba(0,0,0,0.56)",letterSpacing:"0.22em",marginBottom:20,paddingBottom:14,borderBottom:"1px solid rgba(0,0,0,0.08)"}}>NAVIGATION</div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((n,i)=>(
                  <motion.a key={n} href={`#${n.toLowerCase()}`} initial={{opacity:0,x:-8}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.06}}
                    className="group flex items-center gap-2 py-2" style={{fontFamily:MN,fontSize:"11px",color:"rgba(0,0,0,0.55)",letterSpacing:"0.14em",textDecoration:"none",transition:"color .2s"}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="#0a0a0a"} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(0,0,0,0.55)"}>
                    <span style={{width:5,height:1,background:"rgba(0,0,0,0.2)",flexShrink:0}}/>{n.toUpperCase()}
                  </motion.a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* ── Bottom bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-8" style={{borderTop:"1px solid rgba(0,0,0,0.08)"}}>
          <span style={{fontFamily:MN,fontSize:"10px",color:"rgba(0,0,0,0.58)",letterSpacing:"0.1em"}}>© 2026 ALPHIN FRANCIS · ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── HIRE MODAL ─────────────────────────────────────────────────── */
function HireModal({onClose}:{onClose:()=>void}) {
  const [form,setForm]=useState({name:"",email:"",type:"",message:""});
  const [status,setStatus]=useState<"idle"|"sending"|"sent">("idle");
  const [focused,setFocused]=useState("");
  const [clock,setClock]=useState("");
  const types=["FULL-TIME ROLE","INTERNSHIP","RESEARCH COLLAB","CONSULTING","OTHER"];

  useEffect(()=>{
    const t=()=>setClock(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}));
    t();const id=setInterval(t,1000);return()=>clearInterval(id);
  },[]);
  useEffect(()=>{
    const fn=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose();};
    window.addEventListener("keydown",fn);
    document.body.style.overflow="hidden";
    return()=>{window.removeEventListener("keydown",fn);document.body.style.overflow="";};
  },[onClose]);

  const handleSubmit=(e:React.FormEvent)=>{e.preventDefault();if(!form.name||!form.email)return;setStatus("sending");setTimeout(()=>setStatus("sent"),2400);};
  const fs=(f:string):React.CSSProperties=>({display:"block",width:"100%",background:"transparent",fontFamily:MN,fontSize:"15px",color:"#fff",outline:"none",padding:"13px 0 10px",borderBottom:`1px solid ${focused===f?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.22)"}`,transition:"border-color .25s",letterSpacing:"0.03em"});
  const lbl:React.CSSProperties={fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.68)",letterSpacing:"0.2em",display:"block",marginBottom:8};

  return (
    <motion.div
      initial={{clipPath:"inset(50% 0 50% 0)"}}
      animate={{clipPath:"inset(0% 0 0% 0)"}}
      exit={{clipPath:"inset(50% 0 50% 0)"}}
      transition={{duration:0.78,ease:[0.22,1,0.36,1]}}
      style={{position:"fixed",inset:0,zIndex:9990,background:"#050505",display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* Bg decoration */}
      <CircuitBg opacity={0.035}/><HexDotBg opacity={0.018}/>
      <GearDecor size={700} teeth={36} speed={90} opacity={0.018} x="-14%" y="-20%"/>
      <GearDecor size={320} teeth={22} speed={55} opacity={0.025} x="76%" y="52%" reverse/>
      {/* Diagonal grid lines */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"repeating-linear-gradient(60deg,rgba(255,255,255,0.012) 0px,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 60px)",zIndex:0}}/>
      {/* Moving scan line */}
      <motion.div style={{position:"absolute",left:0,right:0,height:1,pointerEvents:"none",zIndex:2,background:"linear-gradient(to right,transparent,rgba(255,255,255,0.04),transparent)"}} animate={{top:["-1%","101%"]}} transition={{duration:6,repeat:Infinity,repeatDelay:8,ease:"linear"}}/>

      {/* ── Top bar ── */}
      <motion.div initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} transition={{delay:0.5,duration:0.6}}
        style={{position:"relative",zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"22px clamp(1.5rem,4.5vw,4rem)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.5)",letterSpacing:"0.3em"}}>SYS</span>
          <div style={{width:1,height:12,background:"rgba(255,255,255,0.1)"}}/>
          <TypeBot text="CONTACT REQUEST" speed={26} style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.62)",letterSpacing:"0.2em"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <span className="hidden sm:block" style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.48)",letterSpacing:"0.16em"}}>{clock}</span>
          <motion.button onClick={onClose} whileHover={{scale:1.03}} whileTap={{scale:0.96}}
            style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.18em",border:"1px solid rgba(255,255,255,0.28)",
              color:"rgba(255,255,255,0.78)",padding:"10px 20px",background:"transparent",cursor:"none",
              display:"flex",alignItems:"center",gap:9,transition:"border-color .2s,color .2s"}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.5)";(e.currentTarget as HTMLElement).style.color="#fff";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.28)";(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.78)";}}>
            ESC <span style={{opacity:0.4}}>/</span> CLOSE ✕
          </motion.button>
        </div>
      </motion.div>

      {/* ── Body ── */}
      <div style={{flex:1,display:"flex",overflow:"hidden",position:"relative",zIndex:5}}>

        {/* LEFT PANEL */}
        <motion.div initial={{opacity:0,x:-50}} animate={{opacity:1,x:0}} transition={{delay:0.55,duration:0.85,ease:[0.22,1,0.36,1]}}
          className="hidden md:flex flex-col justify-between"
          style={{width:"42%",flexShrink:0,padding:"clamp(2.5rem,5vh,4.5rem) clamp(1.5rem,4.5vw,4rem)",
            borderRight:"1px solid rgba(255,255,255,0.05)",position:"relative",overflow:"hidden"}}>
          <HUDCorners lCol="rgba(255,255,255,0.2)" size={18}/>

          {/* Top: display type */}
          <div>
            <div style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.52)",letterSpacing:"0.3em",marginBottom:"2.2rem"}}>01 / INITIATE CONTACT</div>
            <h2 style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(5rem,8.5vw,9.5rem)",letterSpacing:"-0.055em",lineHeight:0.8,marginBottom:"2.8rem"}}>
              LET'S<br/><span style={{color:"rgba(255,255,255,0.34)"}}>BUILD.</span>
            </h2>
            <motion.div initial={{scaleX:0}} animate={{scaleX:1}} transition={{delay:1.0,duration:1.1,ease:[0.22,1,0.36,1]}} style={{width:56,height:1,background:"rgba(255,255,255,0.22)",originX:0,marginBottom:"2rem"}}/>
            <p style={{fontFamily:MN,fontSize:"13px",color:"rgba(255,255,255,0.68)",lineHeight:1.85,maxWidth:"38ch",letterSpacing:"0.01em"}}>
              I'm open to full-time roles in industrial robotics and automation. I'm currently finishing my M.Sc. at TU Dortmund and will be available from 2027.
            </p>
          </div>

          {/* Middle: status rows */}
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:0,padding:"2rem 0"}}>
            {[
              {k:"AVAILABILITY",v:"From 2027",green:true},
              {k:"LOCATION",v:"Leverkusen, Germany"},
              {k:"RESPONSE",v:"< 24 hours"},
              {k:"LANGUAGES",v:"English C1 · Deutsch B1"},
              {k:"EMAIL",v:"alphinfrancis7@gmail.com"},
            ].map(({k,v,green},i)=>(
              <motion.div key={k} initial={{opacity:0,x:-18}} animate={{opacity:1,x:0}} transition={{delay:0.72+i*0.07,ease:[0.22,1,0.36,1]}}
                style={{display:"flex",alignItems:"center",gap:16,padding:"13px 0",borderBottom:"1px solid rgba(255,255,255,0.045)"}}>
                <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.54)",letterSpacing:"0.18em",minWidth:112,flexShrink:0}}>{k}</span>
                {green&&<span style={{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.72)",flexShrink:0}}/>}
                <span style={{fontFamily:green?BG:MN,fontWeight:green?700:400,fontSize:green?"1.12rem":"12px",color:green?"#fff":"rgba(255,255,255,0.76)",letterSpacing:green?"-0.015em":"0.03em"}}>{v}</span>
              </motion.div>
            ))}
          </div>

          {/* Bottom: LinkedIn */}
          <motion.a href="https://www.linkedin.com/in/alphin-francis" target="_blank" rel="noreferrer"
            initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.15}} whileHover={{scale:1.02}}
            style={{display:"inline-flex",alignItems:"center",gap:10,fontFamily:MN,fontSize:"10px",
              letterSpacing:"0.14em",color:"rgba(255,255,255,0.72)",border:"1px solid rgba(255,255,255,0.22)",
              padding:"12px 20px",textDecoration:"none",width:"fit-content",transition:"border-color .22s,color .22s"}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.38)";(e.currentTarget as HTMLElement).style.color="#fff";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.22)";(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.72)";}}>
            <Linkedin size={11}/> VIEW LINKEDIN PROFILE <ArrowUpRight size={11}/>
          </motion.a>
        </motion.div>

        {/* RIGHT PANEL — form */}
        <motion.div initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} transition={{delay:0.6,duration:0.85,ease:[0.22,1,0.36,1]}}
          style={{flex:1,display:"flex",flexDirection:"column",padding:"clamp(2.5rem,5vh,4.5rem) clamp(1.5rem,4.5vw,4rem)",overflow:"auto"}}>

          {/* Terminal header */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"2.5rem",paddingBottom:16,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:`rgba(255,255,255,${0.06+i*0.04})`}}/>)}</div>
            <span style={{fontFamily:MN,fontSize:"10px",color:"rgba(255,255,255,0.62)",letterSpacing:"0.18em"}}>PROJECT INQUIRY</span>
            <span style={{marginLeft:"auto",fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.42)",letterSpacing:"0.12em"}}>REQUIRED FIELDS *</span>
          </div>

          <AnimatePresence mode="wait">
            {status==="sent"?(
              <motion.div key="sent" initial={{opacity:0,scale:0.94}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
                style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:32,textAlign:"center"}}>
                <div style={{position:"relative",width:88,height:88}}>
                  <svg viewBox="0 0 88 88" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
                    <circle cx="44" cy="44" r="40" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none"/>
                    <motion.circle cx="44" cy="44" r="40" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" fill="none"
                      strokeDasharray="251" strokeDashoffset="251"
                      animate={{strokeDashoffset:0}} transition={{duration:1.3,ease:[0.22,1,0.36,1]}}/>
                  </svg>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <motion.svg width="26" height="20" viewBox="0 0 26 20">
                      <motion.path d="M1 10 L9 18 L25 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
                        initial={{pathLength:0}} animate={{pathLength:1}} transition={{delay:0.9,duration:0.75}}/>
                    </motion.svg>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <TypeBot text="TRANSMISSION RECEIVED" speed={28} style={{fontFamily:MN,fontSize:"15px",color:"rgba(255,255,255,0.9)",letterSpacing:"0.18em",display:"block"}}/>
                  <TypeBot text="RESPONSE QUEUED · ETA < 24H" delay={1.1} speed={24} style={{fontFamily:MN,fontSize:"11px",color:"rgba(255,255,255,0.64)",letterSpacing:"0.14em"}}/>
                </div>
                <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.4}} style={{fontFamily:BG,fontWeight:600,fontSize:"1.15rem",color:"rgba(255,255,255,0.62)",letterSpacing:"-0.01em"}}>
                  I'll be in touch shortly.
                </motion.p>
              </motion.div>
            ):(
              <motion.form key="form" onSubmit={handleSubmit} exit={{opacity:0}} style={{flex:1,display:"flex",flexDirection:"column",gap:28}}>
                <div style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.52)",letterSpacing:"0.12em"}}>
                  <span style={{color:"rgba(255,255,255,0.72)"}}>$</span> Tell me what you would like to build.
                </div>
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <div>
                    <label style={lbl}>--NAME *</label>
                    <input required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} onFocus={()=>setFocused("name")} onBlur={()=>setFocused("")} style={fs("name")} placeholder="Full name"/>
                  </div>
                  <div>
                    <label style={lbl}>--EMAIL *</label>
                    <input required type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} onFocus={()=>setFocused("email")} onBlur={()=>setFocused("")} style={fs("email")} placeholder="your@email.com"/>
                  </div>
                </div>
                <div>
                  <label style={lbl}>--SUBJECT_TYPE</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
                    {types.map(t=>(
                      <motion.button key={t} type="button" onClick={()=>setForm(p=>({...p,type:t}))}
                        animate={{backgroundColor:form.type===t?"rgba(255,255,255,0.12)":"rgba(255,255,255,0)",borderColor:form.type===t?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.22)",color:form.type===t?"#fff":"rgba(255,255,255,0.68)"}}
                        transition={{duration:0.18}}
                        style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.1em",padding:"10px 16px",border:"1px solid",cursor:"none"}}>
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div style={{flex:1}}>
                  <label style={lbl}>--MESSAGE</label>
                  <textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} onFocus={()=>setFocused("msg")} onBlur={()=>setFocused("")} rows={6}
                    style={{display:"block",width:"100%",background:"rgba(255,255,255,0.035)",fontFamily:MN,fontSize:"14px",color:"#fff",outline:"none",resize:"none",
                      padding:"14px 16px",letterSpacing:"0.03em",lineHeight:1.9,
                      border:`1px solid ${focused==="msg"?"rgba(255,255,255,0.68)":"rgba(255,255,255,0.2)"}`,transition:"border-color .25s"}}
                    placeholder="Describe your project, role, or inquiry..."/>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em"}}>DIRECT INQUIRY</span>
                  <motion.button type="submit" whileHover={{scale:1.02}} whileTap={{scale:0.97}} disabled={status==="sending"}
                    style={{fontFamily:MN,fontSize:"10.5px",letterSpacing:"0.2em",
                      background:status==="sending"?"transparent":"#fff",
                      color:status==="sending"?"rgba(255,255,255,0.25)":"#080808",
                      border:`1px solid ${status==="sending"?"rgba(255,255,255,0.12)":"#fff"}`,
                      padding:"15px 40px",cursor:"none",display:"flex",alignItems:"center",gap:10,transition:"all .25s"}}>
                    {status==="sending"
                      ?<><span style={{animation:"termBlink 0.4s step-end infinite"}}>█</span> TRANSMITTING...</>
                      :<>TRANSMIT <ArrowUpRight size={13}/></>}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom accent */}
      <div style={{height:1,background:"linear-gradient(to right,transparent,rgba(255,255,255,0.07),transparent)",position:"relative",zIndex:5}}/>
    </motion.div>
  );
}

/* ─── CV VIEWER ──────────────────────────────────────────────────── */
function CVViewer({onClose}:{onClose:()=>void}) {
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose();};
    window.addEventListener("keydown",key);document.body.style.overflow="hidden";
    return()=>{window.removeEventListener("keydown",key);document.body.style.overflow="";};
  },[onClose]);
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[9992] flex flex-col bg-[#080808]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-10">
        <div>
          <div style={{fontFamily:MN,fontSize:"9px",color:"rgba(255,255,255,0.5)",letterSpacing:"0.2em"}}>DOCUMENT / CURRICULUM VITAE</div>
          <div className="mt-1" style={{fontFamily:BG,fontWeight:850,fontSize:"1.2rem"}}>Alphin Francis</div>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <a href={alphinCV} download="Alphin-Francis-CV.pdf" className="flex flex-1 items-center justify-center gap-2 border border-white/25 px-4 py-2.5 text-white transition-colors hover:bg-white hover:text-black sm:flex-none"
            style={{fontFamily:MN,fontSize:"9px",letterSpacing:"0.14em",textDecoration:"none"}}>
            DOWNLOAD PDF
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7m0 0 2.4-2.4M6 8 3.6 5.6M1.5 10.5h9" stroke="currentColor"/></svg>
          </a>
          <button onClick={onClose} className="flex-1 border border-white/15 px-4 py-2.5 text-white/70 hover:border-white/40 hover:text-white sm:flex-none" style={{fontFamily:MN,fontSize:"9px",letterSpacing:"0.14em"}}>CLOSE</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-[#171717] px-3 py-6 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-[920px] flex-col gap-6">
          {[alphinCVPage1,alphinCVPage2].map((page,i)=>(
            <div key={page} className="relative bg-white shadow-2xl">
              <div className="absolute right-3 top-3 z-10 bg-black/75 px-2 py-1 text-white" style={{fontFamily:MN,fontSize:"9px",letterSpacing:"0.12em"}}>PAGE {i+1} / 2</div>
              <img src={page} alt={`My CV page ${i+1}`} className="block h-auto w-full"/>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── RECRUITER MODE ─────────────────────────────────────────────── */
function RecruiterMode({onClose,onViewCV}:{onClose:()=>void;onViewCV:()=>void}) {
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose();};
    window.addEventListener("keydown",key);document.body.style.overflow="hidden";
    return()=>{window.removeEventListener("keydown",key);document.body.style.overflow="";};
  },[onClose]);
  const strengths=[
    ["ROBOT PLATFORMS","UR10 · UR20 · Stäubli TX2-140"],
    ["VISION","RealSense · CubeEye · SensoPart · OpenCV · Open3D"],
    ["SIMULATION","ROS · Gazebo · RViz · RoboDK · Robotics Suite"],
    ["PROGRAMMING","Python · C++ · MATLAB · URScript · VAL3"],
  ];
  return (
    <motion.div initial={{clipPath:"inset(0 0 100% 0)"}} animate={{clipPath:"inset(0)"}} exit={{clipPath:"inset(0 0 100% 0)"}} transition={{duration:0.65,ease:[0.22,1,0.36,1]}}
      className="fixed inset-0 z-[9991] overflow-y-auto bg-[#eeeae3] text-[#0a0a0a]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-[#eeeae3]/95 px-5 py-4 backdrop-blur-xl md:px-10">
        <span style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.18em",color:"rgba(0,0,0,0.68)"}}>RECRUITER MODE / PROFESSIONAL DOSSIER</span>
        <button onClick={onClose} className="border border-black/25 px-5 py-3" style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.12em"}}>EXIT MODE</button>
      </div>
      <div className="mx-auto max-w-screen-2xl px-6 py-16 md:px-14 md:py-24">
        <div className="grid gap-12 border-b border-black/15 pb-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-black"/><span style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.16em",color:"rgba(0,0,0,0.64)"}}>AVAILABLE FOR FULL-TIME ROLES FROM 2027</span></div>
            <h2 style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(4.2rem,9.5vw,10rem)",letterSpacing:"-0.062em",lineHeight:0.76}}>ALPHIN<br/>FRANCIS.</h2>
          </div>
          <div>
            <p style={{fontFamily:BG,fontWeight:750,fontSize:"clamp(1.55rem,3vw,2.4rem)",letterSpacing:"-0.032em",lineHeight:1.2}}>Robotics & Automation Engineer building vision-guided, simulated, commissioned systems.</p>
            <p className="mt-6" style={{fontFamily:MN,fontSize:"14px",lineHeight:1.85,color:"rgba(0,0,0,0.7)"}}>I'm completing my M.Sc. in Automation & Robotics at TU Dortmund and have industry experience at Invite GmbH and Fraunhofer IWU. My hands-on work spans mobile manipulation, Universal Robots, Stäubli programming, perception hardware, robot simulation, validation, troubleshooting, and technical handover.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              <button onClick={onViewCV} className="bg-black px-5 py-3 text-white" style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.14em"}}>VIEW CV</button>
              <a href={alphinCV} download="Alphin-Francis-CV.pdf" className="border border-black/20 px-5 py-3" style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.14em",textDecoration:"none",color:"#0a0a0a"}}>DOWNLOAD CV</a>
              <a href="mailto:alphinfrancis7@gmail.com" className="border border-black/20 px-5 py-3" style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.14em",textDecoration:"none",color:"#0a0a0a"}}>EMAIL ALPHIN</a>
            </div>
          </div>
        </div>

        <div className="grid border-l border-t border-black/12 md:grid-cols-2">
          {strengths.map(([label,value],i)=><motion.div key={label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3+i*0.06}} className="min-h-[190px] border-b border-r border-black/12 p-8 md:p-10"><div style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.15em",color:"rgba(0,0,0,0.56)"}}>{label}</div><div className="mt-6" style={{fontFamily:BG,fontWeight:850,fontSize:"clamp(1.45rem,2.5vw,2.15rem)",letterSpacing:"-0.03em",lineHeight:1.08}}>{value}</div></motion.div>)}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div><div style={{fontFamily:MN,fontSize:"9px",letterSpacing:"0.2em",color:"rgba(0,0,0,0.5)"}}>EXPERIENCE SNAPSHOT</div><h3 className="mt-5" style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(2.5rem,5vw,5rem)",letterSpacing:"-0.05em",lineHeight:0.9}}>FROM LAB<br/>TO CELL.</h3></div>
          <div className="border-t border-black/15">
            {TIMELINE.map(item=><div key={item.year} className="grid gap-4 border-b border-black/15 py-8 md:grid-cols-[140px_1fr]"><span style={{fontFamily:MN,fontSize:"11px",color:"rgba(0,0,0,0.56)"}}>{item.year}</span><div><div style={{fontFamily:BG,fontWeight:850,fontSize:"1.6rem",letterSpacing:"-0.025em"}}>{item.role}</div><div className="mt-2" style={{fontFamily:MN,fontSize:"11px",color:"rgba(0,0,0,0.62)",letterSpacing:"0.07em"}}>{item.org}</div><p className="mt-5" style={{fontFamily:MN,fontSize:"13px",lineHeight:1.8,color:"rgba(0,0,0,0.7)",maxWidth:"90ch"}}>{item.detail}</p></div></div>)}
          </div>
        </div>

        <div className="mt-20 border-t border-black/15 pt-10">
          <div className="mb-9 flex items-end justify-between gap-6">
            <div><div style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.18em",color:"rgba(0,0,0,0.56)"}}>SELECTED PROJECT EVIDENCE</div><h3 className="mt-4" style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(2.6rem,5vw,5.5rem)",letterSpacing:"-0.052em",lineHeight:0.88}}>WHAT I<br/>HAVE BUILT.</h3></div>
            <span className="hidden md:block" style={{fontFamily:MN,fontSize:"10px",color:"rgba(0,0,0,0.5)",letterSpacing:"0.12em"}}>REAL CV PROJECTS / 05</span>
          </div>
          <div className="grid border-l border-t border-black/15 lg:grid-cols-3">
            {PROJECTS.slice(1,4).map((project,i)=><motion.article key={project.num} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.45+i*0.08}} className="flex min-h-[330px] flex-col justify-between border-b border-r border-black/15 p-8">
              <div><div className="flex justify-between"><span style={{fontFamily:MN,fontSize:"10px",color:"rgba(0,0,0,0.52)",letterSpacing:"0.14em"}}>{project.num} / PROJECT</span><span style={{fontFamily:MN,fontSize:"9px",color:"rgba(0,0,0,0.45)"}}>{project.year}</span></div><h4 className="mt-10" style={{fontFamily:BG,fontWeight:900,fontSize:"clamp(1.8rem,2.8vw,2.7rem)",letterSpacing:"-0.04em",lineHeight:0.95}}>{project.title}</h4><p className="mt-5" style={{fontFamily:MN,fontSize:"12px",lineHeight:1.75,color:"rgba(0,0,0,0.66)"}}>{project.desc}</p></div>
              <div className="mt-8 flex flex-wrap gap-2">{project.tags.map(tag=><span key={tag} className="border border-black/15 px-2.5 py-1" style={{fontFamily:MN,fontSize:"9px",color:"rgba(0,0,0,0.58)"}}>{tag}</span>)}</div>
            </motion.article>)}
          </div>
        </div>

        <div className="mt-20 grid gap-12 border-t border-black/15 pt-10 lg:grid-cols-2">
          <div><div style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.18em",color:"rgba(0,0,0,0.56)"}}>EDUCATION</div><div className="mt-7 space-y-7">{TIMELINE.slice(2).map(item=><div key={item.year} className="border-l border-black/20 pl-5"><div style={{fontFamily:BG,fontWeight:850,fontSize:"1.5rem"}}>{item.role}</div><div className="mt-2" style={{fontFamily:MN,fontSize:"11px",color:"rgba(0,0,0,0.62)"}}>{item.org} · {item.year}</div></div>)}</div></div>
          <div><div style={{fontFamily:MN,fontSize:"10px",letterSpacing:"0.18em",color:"rgba(0,0,0,0.56)"}}>LANGUAGES & WORKING PROFILE</div><div className="mt-7 grid grid-cols-2 border-l border-t border-black/15">{[["ENGLISH","C1"],["GERMAN","B1"],["LOCATION","LEVERKUSEN"],["AVAILABILITY","2027"]].map(([label,value])=><div key={label} className="border-b border-r border-black/15 p-6"><div style={{fontFamily:MN,fontSize:"9px",color:"rgba(0,0,0,0.5)"}}>{label}</div><div className="mt-3" style={{fontFamily:BG,fontWeight:900,fontSize:"1.65rem"}}>{value}</div></div>)}</div></div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── APP ────────────────────────────────────────────────────────── */
export default function App() {
  const [loading,setLoading]=useState(true),[ready,setReady]=useState(false);
  const [transitioning,setTransitioning]=useState(false);
  const [transitionTone,setTransitionTone]=useState<"black"|"white">("black");
  const [transitionLabel,setTransitionLabel]=useState("SECTION");
  const [hireOpen,setHireOpen]=useState(false);
  const [cvOpen,setCVOpen]=useState(false);
  const [recruiterOpen,setRecruiterOpen]=useState(false);
  const lowPower=useLowPowerMode();
  const done=useCallback(()=>{setLoading(false);setTimeout(()=>setReady(true),80);},[]);
  useEffect(()=>{
    if(lowPower)return;
    const lenis=new Lenis({
      duration:1.15,
      smoothWheel:true,
      wheelMultiplier:0.88,
      touchMultiplier:1.05,
    });
    let raf=0;
    const frame=(time:number)=>{
      lenis.raf(time);
      raf=requestAnimationFrame(frame);
    };
    raf=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(raf);lenis.destroy();};
  },[lowPower]);
  // Intercept anchor clicks for robotic transition
  useEffect(()=>{
    const fn=(e:MouseEvent)=>{
      const a=(e.target as HTMLElement).closest("a[href^='#']");
      if(!a)return;
      const href=a.getAttribute("href");
      if(!href||href==="#")return;
      e.preventDefault();
      const target=document.querySelector(href) as HTMLElement|null;
      const lightDestination=target?.dataset.theme==="light"||target?.id==="site-footer";
      setTransitionTone(lightDestination?"black":"white");
      setTransitionLabel((target?.id||href.slice(1)||"section").replace(/-/g," "));
      setTransitioning(true);
      setTimeout(()=>{
        if(target){
          const root=document.documentElement;
          const previous=root.style.scrollBehavior;
          root.style.scrollBehavior="auto";
          target.scrollIntoView({block:"start"});
          requestAnimationFrame(()=>{root.style.scrollBehavior=previous;});
        }
      },220);
    };
    document.addEventListener("click",fn);
    return()=>document.removeEventListener("click",fn);
  },[]);
  return (
    <div className={`bg-background text-foreground min-h-screen ${lowPower?"performance-lite":""}`}>
      <style>{`
        *,*::before,*::after{cursor:none!important}
        html{scroll-behavior:smooth;position:relative}
        body{overflow-x:clip;position:relative}
        ::selection{background:rgba(255,255,255,0.1)}
        ::-webkit-scrollbar{width:2px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.05)}
        ::-webkit-scrollbar-track{background:transparent}
        @keyframes gs{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}
        @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
        @keyframes termBlink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes dataFlicker{0%,100%{opacity:0.07}50%{opacity:0.13}}
        .animate-ping{animation:ping 2s cubic-bezier(0,0,.2,1) infinite}
        .work-swipe::-webkit-scrollbar{display:none}
        .kin-range{-webkit-appearance:none;appearance:none;height:28px;background:transparent;cursor:none}
        .kin-range::-webkit-slider-runnable-track{height:3px;background:rgba(255,255,255,.25);border-radius:99px}
        .kin-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;margin-top:-9.5px;border-radius:50%;background:#fff;border:4px solid #111;box-shadow:0 0 0 1px rgba(255,255,255,.55)}
        .kin-range::-moz-range-track{height:3px;background:rgba(255,255,255,.25);border-radius:99px}
        .kin-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:4px solid #111}
        .performance-lite .ambient-loop,.performance-lite .ambient-loop *{animation-play-state:paused!important}
        .performance-lite svg [style*="animation:"]{animation-play-state:paused!important}
        @media (max-width:767px){
          .mobile-safe-type{overflow-wrap:anywhere}
          section{scroll-margin-top:78px}
          a,button{touch-action:manipulation}
          .kin-range{cursor:auto}
        }
        @media (pointer:coarse){
          *,*::before,*::after{cursor:auto!important}
          .robot-cursor{display:none!important}
        }
        @media (prefers-reduced-motion:reduce){
          html{scroll-behavior:auto}
          .animate-ping{animation:none}
        }
      `}</style>
      <Cursor/>
      <ProgressBar/>
      <AnimatePresence>{loading&&<Preloader onDone={done}/>}</AnimatePresence>
      <AnimatePresence>{transitioning&&<RoboticTransition tone={transitionTone} label={transitionLabel} onDone={()=>setTransitioning(false)}/>}</AnimatePresence>
      <AnimatePresence>{hireOpen&&<HireModal onClose={()=>setHireOpen(false)}/>}</AnimatePresence>
      <AnimatePresence>{cvOpen&&<CVViewer onClose={()=>setCVOpen(false)}/>}</AnimatePresence>
      <AnimatePresence>{recruiterOpen&&<RecruiterMode onClose={()=>setRecruiterOpen(false)} onViewCV={()=>{setRecruiterOpen(false);setCVOpen(true);}}/>}</AnimatePresence>
      <Nav onHireClick={()=>setHireOpen(true)} onRecruiterClick={()=>setRecruiterOpen(true)}/>
      <main style={{position:"relative"}}>
        <Hero ready={ready} lowPower={lowPower} onViewCV={()=>setCVOpen(true)}/>
        <Ticker/>
        {/* The former featured case-study route was removed; work now flows directly into the lab. */}
        <WorkSection/>
        <KinematicsLab/>
        <Statement/>
        <About/>
        <Timeline/>
        <Skills/>
        <SystemsLab/>
        <Contact/>
      </main>
      <Footer/>
    </div>
  );
}
