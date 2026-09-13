(() => {
  const rad = d => d * Math.PI / 180;

  function wgs84ToOsgb36(lat, lon) {
    const a = 6378137.0, b = 6356752.3141;
    const phi = rad(lat), lambda = rad(lon);
    const e2 = 1 - (b * b) / (a * a);
    const nu = a / Math.sqrt(1 - e2 * Math.sin(phi) ** 2);
    const x1 = nu * Math.cos(phi) * Math.cos(lambda);
    const y1 = nu * Math.cos(phi) * Math.sin(lambda);
    const z1 = nu * (1 - e2) * Math.sin(phi);

    const tx = -446.448, ty = 125.157, tz = -542.060;
    const scale = 20.4894e-6;
    const rx = rad(-0.1502 / 3600), ry = rad(-0.2470 / 3600), rz = rad(-0.8421 / 3600);
    const x2 = tx + (1 + scale) * x1 - rz * y1 + ry * z1;
    const y2 = ty + rz * x1 + (1 + scale) * y1 - rx * z1;
    const z2 = tz - ry * x1 + rx * y1 + (1 + scale) * z1;

    const A = 6377563.396, B = 6356256.909;
    const e22 = 1 - (B * B) / (A * A);
    const p = Math.sqrt(x2 * x2 + y2 * y2);
    let phi2 = Math.atan2(z2, p * (1 - e22));
    for (let i = 0; i < 10; i++) {
      const nu2 = A / Math.sqrt(1 - e22 * Math.sin(phi2) ** 2);
      const next = Math.atan2(z2 + e22 * nu2 * Math.sin(phi2), p);
      if (Math.abs(next - phi2) < 1e-12) { phi2 = next; break; }
      phi2 = next;
    }
    return { phi: phi2, lambda: Math.atan2(y2, x2), a: A, b: B, e2: e22 };
  }

  function project(lat, lon) {
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return null;
    const g = wgs84ToOsgb36(Number(lat), Number(lon));
    const F0 = 0.9996012717, phi0 = rad(49), lambda0 = rad(-2), N0 = -100000, E0 = 400000;
    const n = (g.a - g.b) / (g.a + g.b);
    const sinPhi = Math.sin(g.phi), cosPhi = Math.cos(g.phi), tanPhi = Math.tan(g.phi);
    const nu = g.a * F0 / Math.sqrt(1 - g.e2 * sinPhi * sinPhi);
    const rho = g.a * F0 * (1 - g.e2) / Math.pow(1 - g.e2 * sinPhi * sinPhi, 1.5);
    const eta2 = nu / rho - 1;
    const dPhi = g.phi - phi0;
    const Ma = (1 + n + 5/4*n*n + 5/4*n**3) * dPhi;
    const Mb = (3*n + 3*n*n + 21/8*n**3) * Math.sin(dPhi) * Math.cos(g.phi + phi0);
    const Mc = (15/8*n*n + 15/8*n**3) * Math.sin(2*dPhi) * Math.cos(2*(g.phi + phi0));
    const Md = 35/24*n**3 * Math.sin(3*dPhi) * Math.cos(3*(g.phi + phi0));
    const M = g.b * F0 * (Ma - Mb + Mc - Md);
    const I = M + N0;
    const II = nu/2 * sinPhi * cosPhi;
    const III = nu/24 * sinPhi * cosPhi**3 * (5 - tanPhi**2 + 9*eta2);
    const IIIA = nu/720 * sinPhi * cosPhi**5 * (61 - 58*tanPhi**2 + tanPhi**4);
    const IV = nu * cosPhi;
    const V = nu/6 * cosPhi**3 * (nu/rho - tanPhi**2);
    const VI = nu/120 * cosPhi**5 * (5 - 18*tanPhi**2 + tanPhi**4 + 14*eta2 - 58*tanPhi**2*eta2);
    const dLambda = g.lambda - lambda0;
    return {
      easting: E0 + IV*dLambda + V*dLambda**3 + VI*dLambda**5,
      northing: I + II*dLambda**2 + III*dLambda**4 + IIIA*dLambda**6
    };
  }

  function gridLetters(easting, northing) {
    const e100 = Math.floor(easting / 100000), n100 = Math.floor(northing / 100000);
    if (e100 < 0 || e100 > 6 || n100 < 0 || n100 > 12) return '';
    let l1 = (19 - n100) - ((19 - n100) % 5) + Math.floor((e100 + 10) / 5);
    let l2 = ((19 - n100) * 5) % 25 + (e100 % 5);
    if (l1 > 7) l1++;
    if (l2 > 7) l2++;
    return String.fromCharCode(l1 + 65) + String.fromCharCode(l2 + 65);
  }

  function gridRef(easting, northing, digits = 8) {
    const letters = gridLetters(easting, northing);
    if (!letters) return '';
    digits = [2,4,6,8,10].includes(digits) ? digits : 8;
    const half = digits / 2;
    const factor = 10 ** (5 - half);
    const e = Math.floor((easting % 100000) / factor).toString().padStart(half, '0');
    const n = Math.floor((northing % 100000) / factor).toString().padStart(half, '0');
    return `${letters} ${e} ${n}`;
  }

  function precisionForAccuracy(accuracy) {
    const a = Number(accuracy);
    if (!Number.isFinite(a)) return 8;
    if (a <= 3) return 10;
    if (a <= 20) return 8;
    if (a <= 100) return 6;
    return 4;
  }

  function fromWgs84(lat, lon, accuracy) {
    const p = project(lat, lon);
    if (!p) return null;
    const digits = precisionForAccuracy(accuracy);
    return {
      easting: Math.round(p.easting),
      northing: Math.round(p.northing),
      gridRef: gridRef(p.easting, p.northing, digits),
      digits,
      approximate: true
    };
  }

  window.BNG = { fromWgs84, gridRef, project, precisionForAccuracy };
})();
