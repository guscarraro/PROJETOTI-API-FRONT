// import React, { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";
// import { dwsGetLatest } from "../../services/dwsPublic";
// import Mini3D from "./Mini3D";

// import {
//   Full,
//   Shell,
//   Top,
//   HeadLeft,
//   Title,
//   Badge,
//   Mini3D as Mini3DWrap,
//   Body,
//   Grid4,
//   Tile,
//   TLabel,
//   TValue,
//   BigRow,
//   BigLabel,
//   BigValue,
//   Footer,
//   Small,
// } from "./style";

// export default function KioskBalanca() {
//   const { deviceId: deviceIdParam } = useParams();
//   const deviceId = deviceIdParam || "projeto-m3-esp32-01";

//   // 🔧 MOCK: deixa true pra testar layout sem back
//   const MOCK = true;

//   const [loading, setLoading] = useState(true);
//   const [online, setOnline] = useState(true);
//   const [data, setData] = useState(null);
//   const [lastOkAt, setLastOkAt] = useState(null);

//   useEffect(() => {
//     let mounted = true;

//     if (MOCK) {
//       setLoading(false);
//       setOnline(true);
//       setData({
//         device_id: deviceId,
//         width_mm: 400,
//         height_mm: 200,
//         length_mm: 430,
//         weight_kg: 42.75,
//         volume_m3: 0.0145,
//         created_at: new Date().toISOString(),
//       });
//       return () => {
//         mounted = false;
//       };
//     }

//     async function tick() {
//       try {
//         const latest = await dwsGetLatest(deviceId);
//         if (!mounted) return;

//         setData(latest && Object.keys(latest).length ? latest : null);
//         setOnline(true);
//         setLastOkAt(Date.now());
//       } catch (e) {
//         if (!mounted) return;
//         setOnline(false);
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     }

//     tick();
//     const id = setInterval(tick, 900);
//     return () => {
//       mounted = false;
//       clearInterval(id);
//     };
//   }, [deviceId, MOCK]);

//   const dims = useMemo(() => {
//     const w = Number(data?.width_mm ?? 0);
//     const h = Number(data?.height_mm ?? 0);
//     const l = Number(data?.length_mm ?? 0);
//     return { w, h, l };
//   }, [data]);

//   const weight = Number(data?.weight_kg ?? 0);
//   const volume = Number(data?.volume_m3 ?? 0);

//   if (loading) {
//     return (
//       <Full>
//         <Shell>
//           <Top>
//             <HeadLeft>
//               <Title>Inicializando</Title>
//               <Badge $status="loading">AGUARDANDO</Badge>
//             </HeadLeft>

//             <Mini3DWrap />
//           </Top>

//           <Body>
//             <Small>Conectando e aguardando dados…</Small>
//           </Body>
//         </Shell>
//       </Full>
//     );
//   }

//   if (!online) {
//     return (
//       <Full>
//         <Shell>
//           <Top>
//             <HeadLeft>
//               <Title>Sem rede</Title>
//               <Badge $status="off">OFFLINE</Badge>
//             </HeadLeft>

//             <Mini3DWrap />
//           </Top>

//           <Body>
//             <Small>Verifique Wi-Fi / internet. Tentando reconectar…</Small>
//             {lastOkAt && (
//               <Small style={{ opacity: 0.7 }}>
//                 Último ok: {new Date(lastOkAt).toLocaleTimeString()}
//               </Small>
//             )}
//           </Body>
//         </Shell>
//       </Full>
//     );
//   }

//   return (
//     <Full>
//       <Shell>
//         <Top>
//           <HeadLeft>
//             <Title>Dimensões</Title>
//             <Badge $status="on">ONLINE</Badge>
//           </HeadLeft>

//           <Mini3DWrap>
//             <Mini3D w={dims.w} h={dims.h} l={dims.l} />
//           </Mini3DWrap>
//         </Top>

//         <Body>
//           <Grid4>
//             <Tile>
//               <TLabel>X</TLabel>
//               <TValue>{dims.w} mm</TValue>
//             </Tile>
//             <Tile>
//               <TLabel>Y</TLabel>
//               <TValue>{dims.h} mm</TValue>
//             </Tile>
//             <Tile>
//               <TLabel>Z</TLabel>
//               <TValue>{dims.l} mm</TValue>
//             </Tile>
//             <Tile>
//               <TLabel>Peso</TLabel>
//               <TValue>{weight.toFixed(2)} kg</TValue>
//             </Tile>
//           </Grid4>

//           <BigRow>
//             <BigLabel>VOLUME (m³)</BigLabel>
//             <BigValue>{volume.toFixed(4)}</BigValue>
//           </BigRow>

//           <Footer>
//             <Small>
//               Atualizado:{" "}
//               <b>
//                 {data?.created_at
//                   ? new Date(data.created_at).toLocaleTimeString()
//                   : "-"}
//               </b>
//             </Small>
//           </Footer>
//         </Body>
//       </Shell>
//     </Full>
//   );
// }
