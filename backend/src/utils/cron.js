// // A simple background task to mark inactive devices as offline
// const markOfflineDevices = async () => {
//   const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
//   await Device.update(
//     { is_online: false },
//     { 
//       where: { 
//         last_seen: { [Op.lt]: fiveMinutesAgo },
//         is_online: true 
//       } 
//     }
//   );
// };