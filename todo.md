
# Character Creation All-in-One Studio - Todo List

## 🎯 Priority Phase 1 (Core Features)

### Phase 1: Complete Front-facing Character Creation
- [ ] **Basic Parts System Development**
  - [x] Face, eyes, nose, mouth, ears parts library
  - [x] Body (including arms and legs) parts library
  - [ ] Tail parts library

- [ ] **Pattern System Development**
  - [ ] Blush, ear patterns, belly patterns options
  - [ ] Eyebrows, animal patterns options
  - [ ] UI guidance for 3-pattern limit

- [x] **Editing Features Implementation**
  - [x] Position adjustment for each part
  - [x] Rotation function for each part
  - [x] Color change (coloring) function for each part
  - [x] Layer order adjustment (for folded ears, etc.)

- [ ] **Jjiba Guide System**
  - [ ] Popup-style speech bubble UI implementation
  - [ ] Tips message database creation
    - "The closer the eyes and nose, the younger it looks; the farther apart, the more mature!"
    - "Less is more! We recommend using 3 or fewer patterns!"
  - [ ] Display tips at appropriate timing for each editing stage

---

### Phase 2: Character Turnaround Creation
- [x] **Basic View Generation System**
  - [x] Auto-conversion logic based on front-facing data
  - [x] 4-direction view canvas setup (front, side, back, three-quarter)

- [ ] **Side View Generation Logic**
  - [ ] Auto-reduce eye width to 60%
  - [ ] Cut nose/mouth in half + place on face side line
  - [ ] Reduce blush and other patterns width to 60%
  - [ ] Adjust tail position

- [ ] **Back View Generation Logic**
  - [x] Auto-remove eyes/nose/mouth
  - [ ] Place back-facing parts (tail, etc.)

- [ ] **Three-quarter View Generation Logic**
  - [ ] Shift entire position to the left
  - [ ] Adjust left eye position closer to nose
  - [ ] Implement overflow pattern handling
    - Option 1: White background masking
    - Option 2: Size limit validation
  - [ ] Test and confirm optimal method

- [ ] **Turnaround Editing Features**
  - [ ] Individual size adjustment per view
  - [ ] Fine-tune position per view
  - [ ] Rotation adjustment per view

---

### Phase 3: Character Action/Pose Creation
- [ ] **Action Library Design**
  - [ ] Define basic actions (walking, running, sitting, lying down, etc.)
  - [ ] Define emotion actions (happy, sad, angry, surprised, etc.)
  - [ ] Define special actions (heart, clap, jump, etc.)

- [ ] **Face System**
  - [ ] Front-facing data reuse system
  - [ ] Apply facial expression changes per action

- [ ] **Body Action Source Creation**
  - [ ] Create new body parts for each action
  - [ ] Build body library
  - [ ] Face-body combination preview feature

---

## 🔄 Priority Phase 2 (Extended Features)

### Phase 4: Emoticon Creation
- [ ] **Cut Image Editing System**
  - [ ] Action selection feature
  - [ ] Text addition tool
  - [ ] Effect addition tool
  - [ ] Props addition tool
  - [ ] Background addition tool

- [ ] **Static Emoticon Generation**
  - [ ] Final image compositing engine
  - [ ] Export to emoticon specs (KakaoTalk, LINE, etc.)

- [ ] **Animated Emoticon Creation**
  - [ ] Frame animation system
  - [ ] Timeline editor
  - [ ] GIF/APNG export

---

### Phase 5: Instatoon (Webtoon) Creation
- [ ] **Frame System**
  - [ ] Various layout templates (1-panel, 4-panel, 6-panel, etc.)
  - [ ] Frame size/spacing adjustment

- [ ] **Speech Bubble System**
  - [ ] Various speech bubble style library
  - [ ] Speech bubble position/size adjustment
  - [ ] Text input and styling

- [ ] **Panel Editing Features**
  - [ ] Place character actions in each panel
  - [ ] Add backgrounds/effects
  - [ ] Export to Instagram specs

---

### Phase 6: Goods/Merchandise Creation
- [ ] **Goods Design Editor**
  - [ ] Action selection and placement
  - [ ] Props library
  - [ ] Effects library

- [ ] **Templates by Goods Type**
  - [ ] Sticker design template
  - [ ] Memo pad design template
  - [ ] Other goods templates

- [ ] **Print-ready Export**
  - [ ] High-resolution image generation
  - [ ] Cut line inclusion option
  - [ ] PDF/AI file export

---

### Phase 7: Portfolio Creation
- [ ] **Define Portfolio Components**
- [ ] **Auto Portfolio Generation Feature**
- [ ] **PDF Export**

---

## 📋 Development Order Summary
1. **Phase 1**: Complete front-facing character → Turnaround → Action creation
2. **Phase 2**: Emoticon → Instatoon → Goods → Portfolio



