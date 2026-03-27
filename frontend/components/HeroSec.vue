<template>
  <section style="background:linear-gradient(to right, #0e0905 40%, #2a1a08 100%); min-height:480px; position:relative; overflow:hidden;">
    
    <!-- Background image overlay -->
    <div style="
      position:absolute; right:0; top:0; width:55%; height:100%;
      background:url('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=900') center/cover;
      opacity:0.35;
      mask-image:linear-gradient(to right, transparent, black 40%);
      -webkit-mask-image:linear-gradient(to right, transparent, black 40%);
    "></div>

    <div class="container-fluid px-5 py-5 position-relative" style="z-index:2;">
      <div class="row">
        <div class="col-md-6 py-5">
          
          <!-- Badge -->
          <span class="badge rounded-pill mb-3" style="background:#c0392b; font-size:0.7rem; letter-spacing:1px;">
            MEMBER EXCLUSIVE ACCESS
          </span>

          <!-- Title -->
          <h1 class="display-4 fw-bold text-white mb-3" style="font-family:'Georgia', serif; line-height:1.1;">
            Exquisite Spirits<br>
            for <span style="color:#c9a84c;">Connoisseurs</span>
          </h1>

          <!-- Description -->
          <p class="mb-4" style="color:#a89880; line-height:1.7; max-width:420px;">
            Discover our curated collection of rare vintage wines, artisanal craft beers, and premium world-class spirits.
          </p>

          <!-- Buttons -->
          <div class="d-flex gap-3">
            <button class="btn px-4 py-2 fw-semibold" style="background:#c0392b; color:white; border-radius:6px;">
              Shop Collection
            </button>
            <button class="btn px-4 py-2 fw-semibold" style="background:transparent; color:white; border:1px solid #555; border-radius:6px;">
              View Specials
            </button>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>