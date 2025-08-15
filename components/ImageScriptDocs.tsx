import React, { useRef } from 'react';

interface ImageScriptDocsProps {
  onClose: () => void;
}

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <code className="bg-slate-200/50 text-slate-800 font-semibold text-sm py-0.5 px-1.5 rounded-md border border-slate-300/50">{children}</code>
)

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-800 text-slate-200 font-mono text-sm p-4 rounded-lg overflow-x-auto my-4 shadow-inner shadow-black/20">
        <code>{children}</code>
    </pre>
)

const SectionTitle: React.FC<{id: string, children: React.ReactNode}> = ({ id, children }) => (
     <h2 id={id} className="text-3xl font-extrabold text-slate-800 border-b-2 border-indigo-200 pb-2 mb-6 scroll-mt-24">
        {children}
    </h2>
);

const SubSectionTitle: React.FC<{id: string, children: React.ReactNode}> = ({ id, children }) => (
    <h3 id={id} className="text-2xl font-bold text-slate-700 mt-8 mb-4 scroll-mt-24">
        {children}
    </h3>
);

const ImageScriptDocs: React.FC<ImageScriptDocsProps> = ({ onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleNavClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const NavLink: React.FC<{ id: string, children: React.ReactNode, sub?: boolean, subsub?: boolean }> = ({ id, children, sub, subsub }) => (
    <a href={`#${id}`} onClick={(e) => handleNavClick(e, id)} className={`block font-medium rounded-md transition-colors duration-150 ${subsub ? 'text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 pl-9' : sub ? 'text-sm text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 pl-6' : 'text-base text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 pl-3'} py-1.5`}>
        {children}
    </a>
  );
  
  const NavHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">{children}</h4>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-pop-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-800">The ImageScript Book</h1>
             <button
                onClick={onClose}
                className="w-9 h-9 bg-slate-200/70 hover:bg-slate-300/80 rounded-full text-slate-600 flex items-center justify-center transition-colors"
                aria-label="Close documentation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </header>

        <div className="flex-grow flex overflow-hidden">
            <aside className="w-72 flex-shrink-0 bg-slate-100/70 border-r border-slate-200 p-4 overflow-y-auto">
                <nav>
                    <NavHeader>Chapter 1: Introduction</NavHeader>
                    <NavLink id="intro-what-is">What is ImageScript?</NavLink>
                    <NavLink id="intro-philosophy">The Core Philosophy</NavLink>
                    <NavLink id="intro-who-for">Who Is This For?</NavLink>

                    <NavHeader>Chapter 2: The Fundamentals</NavHeader>
                    <NavLink id="start-first-script">Your First Script</NavLink>
                    <NavLink id="start-syntax">Syntax Deep Dive</NavLink>
                    <NavLink id="start-parser">How It Works: The Parser</NavLink>
                    
                    <NavHeader>Chapter 3: The `create` Command</NavHeader>
                    <NavLink id="create-subject">Defining Your Subject</NavLink>
                    <NavLink id="create-types">Subject Types</NavLink>
                    <NavLink id="create-properties">Common Properties</NavLink>

                    <NavHeader>Chapter 4: The `set` Suite</NavHeader>
                    <NavLink id="set-scene" sub>set scene</NavLink>
                    <NavLink id="set-style" sub>set style</NavLink>
                    <NavLink id="set-camera" sub>set camera</NavLink>
                    <NavLink id="set-palette" sub>set palette</NavLink>

                    <NavHeader>Chapter 5: Advanced Guides</NavHeader>
                    <NavLink id="adv-cascade">The Specificity Cascade</NavLink>
                    <NavLink id="adv-complex">Composing Complex Scenes</NavLink>
                    <NavLink id="adv-thinking">Thinking in Layers</NavLink>

                    <NavHeader>Chapter 6: The Cookbook</NavHeader>
                    <NavLink id="cook-photo" sub>Photographic</NavLink>
                    <NavLink id="cook-photoreal" subsub>Photorealistic Portrait</NavLink>
                    <NavLink id="cook-noir" subsub>Cinematic Film Noir</NavLink>
                    <NavLink id="cook-wes" subsub>Wes Anderson Style</NavLink>
                    <NavLink id="cook-macro" subsub>Dramatic Macro Insect</NavLink>
                    
                    <NavLink id="cook-artistic" sub>Artistic</NavLink>
                    <NavLink id="cook-ukiyo" subsub>Ukiyo-e Woodblock</NavLink>
                    <NavLink id="cook-dali" subsub>Surrealist Dreamscape</NavLink>
                    <NavLink id="cook-nouveau" subsub>Art Nouveau Poster</NavLink>
                    <NavLink id="cook-ghibli" subsub>Ghibli-style Scene</NavLink>

                    <NavLink id="cook-thematic" sub>Thematic</NavLink>
                    <NavLink id="cook-fantasy" subsub>Epic Fantasy</NavLink>
                    <NavLink id="cook-cyberpunk" subsub>Gritty Cyberpunk</NavLink>
                    <NavLink id="cook-50s-scifi" subsub>Vintage Sci-Fi</NavLink>
                    <NavLink id="cook-gothic" subsub>Gothic Horror</NavLink>

                    <NavLink id="cook-sfx" sub>Special Effects</NavLink>
                    <NavLink id="cook-sticker" subsub>Die-Cut Sticker</NavLink>
                    <NavLink id="cook-lego" subsub>Lego Model</NavLink>
                    <NavLink id="cook-blueprint" subsub>Technical Blueprint</NavLink>
                    <NavLink id="cook-double" subsub>Double Exposure</NavLink>
                    
                    <NavHeader>Chapter 7: Reference</NavHeader>
                    <NavLink id="ref-commands">Command Reference</NavLink>
                    <NavLink id="ref-properties">Property Compendium</NavLink>
                </nav>
            </aside>
            <main ref={contentRef} className="flex-grow overflow-y-auto p-8 lg:p-12 prose prose-slate max-w-none">
                <SectionTitle id="intro-what-is">Chapter 1.1: What is ImageScript?</SectionTitle>
                <p>Welcome to <strong>ImageScript</strong>, a declarative language for creating images with AI. It transforms the art of prompt engineering into a more structured, readable, and powerful process. Instead of wrestling with long, chaotic sentences, you can define your image's subject, environment, and style with clean, organized, code-like blocks.</p>
                <p>Imagine the traditional way of prompting: "a photorealistic portrait of an old sea captain with a weathered face and a white beard, staring intensely at the camera, in front of a stormy sea, dramatic lighting, 8k, hyperdetailed". This works, but it's fragile. What if you want to change the lighting? Or the location? You have to carefully dissect and rewrite the sentence.</p>
                <p>With ImageScript, you command the AI like a director on a film set. You have separate controls for the "actor" (<Code>create</Code>), the "set" (<Code>set scene</Code>), the "look" (<Code>set style</Code>), and the "camera" (<Code>set camera</Code>). This structured approach not only makes your intentions clearer to the AI but also to yourself, leading to more intentional and often surprising results.</p>
                
                <SubSectionTitle id="intro-philosophy">1.2: The Core Philosophy</SubSectionTitle>
                <ul>
                    <li><strong>Clarity over Chaos:</strong> Good prompts are clear. ImageScript enforces clarity by separating concerns. The subject is distinct from the scene, and the style is its own component. This makes your ideas easier to write, read, and most importantly, iterate on.</li>
                    <li><strong>Structure for Creativity:</strong> Constraints can fuel creativity. By providing a structure, ImageScript helps you think through the different elements of your image, often leading to more detailed and imaginative results than a simple sentence prompt.</li>
                    <li><strong>Iterative by Design:</strong> ImageScript is perfect for experimentation. Want to see your character in a different setting? Just swap out the <Code>set scene</Code> block. Want to try a new artistic style? Change the <Code>set style</Code> block. The core idea remains intact and reusable.</li>
                    <li><strong>Human-Readable:</strong> A well-written ImageScript is self-documenting. You can look at a script from weeks ago and immediately understand the intent behind it.</li>
                </ul>

                <SubSectionTitle id="intro-who-for">1.3: Who Is This For?</SubSectionTitle>
                <p>ImageScript is designed for anyone who wants more control and precision in their AI image generation workflow.</p>
                <ul>
                    <li><strong>Artists & Designers:</strong> Gain fine-grained control over composition, lighting, and style. Use it for concept art, mood boards, and illustration.</li>
                    <li><strong>Developers:</strong> Integrate a structured, predictable image generation language into your applications.</li>
                    <li><strong>Writers & World-builders:</strong> Bring your characters and worlds to life with consistent, detailed visuals.</li>
                    <li><strong>Hobbyists & Enthusiasts:</strong> Move beyond basic prompting and unlock a new level of creative expression.</li>
                </ul>

                <SectionTitle id="start-first-script">Chapter 2.1: Your First Script</SectionTitle>
                <p>Let's dive in by translating a simple idea into ImageScript: "A brave knight in shining armor in a dark forest".</p>
                <CodeBlock>
{`// Start by defining the main subject.
create person "brave knight" {
    wearing: "heavy, polished steel armor";
    holding: "a longsword glowing with faint blue light";
}

// Next, describe the environment.
set scene "dark, ancient forest" {
    atmosphere: "eerie, mysterious, shafts of moonlight";
    location: "a narrow path surrounded by gnarled trees";
}

// Finally, set the overall artistic style.
set style {
    type: "epic fantasy digital painting";
    artist: "in the style of frank frazetta and greg rutkowski";
}`}
                </CodeBlock>
                <p>When you execute this script, the parser combines these structured blocks into a rich, coherent prompt for the AI. Notice how we've added details like the glowing sword and the shafts of moonlight—details that naturally arise when you think in these separate categories.</p>
                
                <SubSectionTitle id="start-syntax">2.2: Syntax Deep Dive</SubSectionTitle>
                <p>ImageScript's syntax is simple, consistent, and designed to be easy to read.</p>
                <ul>
                    <li><strong>Comments:</strong> Start a line with <Code>//</Code> to write a comment. The parser completely ignores these lines. They are for your notes.</li>
                    <li><strong>Commands:</strong> Keywords like <Code>create</Code> and <Code>set</Code>. They are the primary actions and always appear at the start of a block.</li>
                    <li><strong>Blocks:</strong> Commands are followed by a name (optional for some) and a set of curly braces <Code>{`{...}`}</Code>. This defines a logical grouping of details.</li>
                    <li><strong>Properties:</strong> Inside a block, you define details with <Code>key: "value";</Code> pairs.
                        <ul>
                          <li>The <strong>key</strong> is a simple descriptor (e.g., <Code>wearing</Code>, <Code>atmosphere</Code>).</li>
                          <li>It is followed by a colon <Code>:</Code>.</li>
                          <li>The <strong>value</strong> is your description, always enclosed in double quotes <Code>"..."</Code>.</li>
                          <li>Every property declaration <strong>must</strong> end with a semicolon <Code>;</Code>. This is crucial!</li>
                        </ul>
                    </li>
                </ul>

                <SubSectionTitle id="start-parser">2.3: How It Works: The Parser</SubSectionTitle>
                <p>ImageScript itself is not an AI. It's a structured language that a simple <strong>parser</strong> reads. The parser's job is to walk through your script, collect all your definitions from the <Code>create</Code> and <Code>set</Code> blocks, and assemble them into a single, large, descriptive text prompt. This final prompt is what gets sent to the image generation model.</p>
                <p>This is an important concept: you are not "coding an image," you are "structuring a description." Understanding this helps you write more effective scripts by focusing on providing clear, descriptive text within the provided structure.</p>
                <p><em>Note: The current parser only recognizes the <strong>first</strong> <Code>create</Code> block it finds. Multiple <Code>create</Code> blocks are not yet supported.</em></p>

                <SectionTitle id="create-subject">Chapter 3.1: The `create` Command</SectionTitle>
                <p>The <Code>create</Code> command is the heart of your image. It defines the focal point—the main subject or character. A strong script almost always starts with a strong <Code>create</Code> block.</p>
                <p><strong>Syntax:</strong> <Code>{`create <type> "name" { ... }`}</Code></p>
                
                <SubSectionTitle id="create-types">3.2: Subject Types</SubSectionTitle>
                <p>The <Code>{`<type>`}</Code> helps the AI categorize your subject. While you can use any word, here are some effective starting points:</p>
                <ul>
                    <li><Code>person</Code>: For human or humanoid characters.</li>
                    <li><Code>creature</Code>: For animals, monsters, and fantasy beings.</li>
                    <li><Code>object</Code>: For inanimate items, from a simple cup to a magical artifact.</li>
                    <li><Code>vehicle</Code>: For cars, spaceships, or any mode of transport.</li>
                    <li><Code>building</Code>: For architecture as the main subject.</li>
                    <li><Code>scene</Code>: Use this if the entire environment is the subject, e.g., <Code>create scene "a beautiful mountain vista"</Code>.</li>
                </ul>

                <SubSectionTitle id="create-properties">3.3: Common Properties</SubSectionTitle>
                <p>Inside the <Code>create</Code> block, you bring your subject to life. Be descriptive! Here are some of the most useful properties:</p>
                <ul>
                    <li><Code>description:</Code> The most important property. Add adjectives and key physical details here. (e.g., <Code>description: "a tall, slender elf with silver hair";</Code>)</li>
                    <li><Code>action:</Code> What is the subject doing? Make it active. (e.g., <Code>action: "casting a powerful spell at the viewer";</Code>)</li>
                    <li><Code>wearing:</Code> For people or creatures, describe their clothing or armor. (e.g., <Code>wearing: "ornate golden armor engraved with sun motifs";</Code>)</li>
                    <li><Code>holding:</Code> An object the subject is holding. (e.g., <Code>holding: "a crystal staff that crackles with energy";</Code>)</li>
                    <li><Code>expression:</Code> Define the facial expression for powerful emotion. (e.g., <Code>expression: "a look of fierce determination";</Code>)</li>
                </ul>

                <SectionTitle id="set-scene">Chapter 4.1: `set scene`</SectionTitle>
                <p>This block controls the environment, background, and atmosphere of the image. It builds the world your subject inhabits.</p>
                <p><strong>Syntax:</strong> <Code>{`set scene "name" { ... }`}</Code></p>
                <p><strong>Common Properties:</strong></p>
                <ul>
                    <li><Code>location:</Code> The broader setting. "a forgotten temple deep in a jungle", "a bustling cyberpunk market".</li>
                    <li><Code>atmosphere:</Code> The mood and feeling. "eerie, mysterious, foggy", "joyful and celebratory, filled with confetti".</li>
                    <li><Code>lighting:</Code> Crucial for mood. "dramatic, volumetric lighting filtering through trees", "soft, diffuse light from an overcast sky", "harsh neon glow".</li>
                    <li><Code>time_of_day:</Code> "dusk", "midnight", "golden hour", "high noon".</li>
                    <li><Code>weather:</Code> "gentle rain", "heavy snowstorm", "clear and sunny with a slight breeze".</li>
                    <li><Code>details:</Code> Add specific background elements. "the ground is covered in glowing mushrooms", "flying vehicles zip between towering skyscrapers".</li>
                </ul>
                <CodeBlock>
{`set scene "rainy neo-tokyo street" {
    location: "a narrow alleyway filled with noodle shops";
    atmosphere: "melancholy, reflective, lonely";
    lighting: "lit by glowing neon signs reflecting off wet pavement";
    details: "steam rises from sewer grates";
}`}
                </CodeBlock>

                <SubSectionTitle id="set-style">4.2: `set style`</SubSectionTitle>
                <p>This is arguably the most powerful block. It defines the entire artistic and aesthetic direction of the image. It's the only <Code>set</Code> command that doesn't take a name.</p>
                <p><strong>Syntax:</strong> <Code>{`set style { ... }`}</Code></p>
                <p><strong>Common Properties:</strong></p>
                <ul>
                    <li><Code>type:</Code> The medium. "oil painting", "digital art", "3d render", "photograph", "anime screenshot", "watercolor sketch", "charcoal drawing".</li>
                    <li><Code>artist:</Code> Emulate the style of artists. You can combine them! "in the style of greg rutkowski, artgerm, and alphonse mucha".</li>
                    <li><Code>realism:</Code> "hyperrealistic", "photorealistic", "stylized", "abstract", "cartoonish", "impressionistic".</li>
                    <li><Code>details:</Code> Specify the level of detail. "intricate detail", "highly detailed", "8k, UHD, masterpiece, award-winning".</li>
                    <li><Code>genre:</Code> "high fantasy", "cyberpunk", "steampunk", "lo-fi", "art deco", "gothic horror".</li>
                </ul>

                <SubSectionTitle id="set-camera">4.3: `set camera`</SubSectionTitle>
                <p>For photographic or cinematic images, this block gives you precise control over the virtual camera, framing, and lens effects.</p>
                <p><strong>Common Properties:</strong></p>
                <ul>
                    <li><Code>angle:</Code> "low angle shot", "dutch angle", "bird's-eye view", "wide shot", "extreme close-up", "worm's-eye view".</li>
                    <li><Code>lens:</Code> "85mm", "35mm f/1.4", "macro lens", "wide-angle fisheye lens", "anamorphic lens".</li>
                    <li><Code>focus:</Code> "sharp focus on subject", "soft focus background with beautiful bokeh", "deep depth of field", "motion blur".</li>
                    <li><Code>composition:</Code> Use photographic principles. "rule of thirds", "leading lines", "centered composition", "golden ratio".</li>
                    <li><Code>film_type:</Code> Emulate real film stock for color and grain. "Kodak Portra 400", "Ilford HP5", "cinestill 800t", "polaroid".</li>
                </ul>

                <SubSectionTitle id="set-palette">4.4: `set palette`</SubSectionTitle>
                <p>Guide the color scheme of the image to evoke a specific mood or aesthetic.</p>
                <p><strong>Common Properties:</strong></p>
                <ul>
                    <li><Code>colors:</Code> Describe the colors or a color relationship. "vibrant complementary blues and oranges", "a monochromatic palette of cool greys", "pastel pinks, blues, and purples".</li>
                    <li><Code>mood:</Code> "warm and inviting", "cold and clinical", "pastel and dreamy", "dark and foreboding".</li>
                    <li><Code>contrast:</Code> "high contrast, dramatic shadows", "low contrast, muted, and soft".</li>
                    <li><Code>saturation:</Code> "highly saturated, vibrant colors", "desaturated, almost black and white".</li>
                </ul>

                <SectionTitle id="adv-cascade">Chapter 5.1: The Specificity Cascade</SectionTitle>
                <p>The magic of ImageScript comes from how the different blocks combine. The AI reads your script and synthesizes a final, detailed prompt from it. A general rule is that <strong>more specific instructions add to or override general ones.</strong></p>
                <p>Think of it as a cascade:</p>
                <ol>
                    <li><Code>set style {`{ type: "photograph"; }`}</Code> is a general instruction.</li>
                    <li><Code>set camera {`{ lens: "85mm f/1.4"; }`}</Code> is a more specific instruction.</li>
                </ol>
                <p>When combined, the AI doesn't get confused. It understands you want a photograph, and specifically, one that looks like it was taken with an 85mm lens, which implies a portrait with a blurred background. The specificity of the camera block enhances the generality of the style block.</p>
                <p>This allows for incredible creative combinations. What happens when you request a <Code>creature "dragon"</Code> but set the style to <Code>type: "technical blueprint drawing"</Code>? You get exactly that! The system is designed for these imaginative mergers.</p>

                <SubSectionTitle id="adv-complex">5.2: Composing Complex Scenes</SubSectionTitle>
                <p>Because the parser currently only supports one <Code>create</Code> block, you might wonder how to create scenes with multiple characters or key objects. The solution is to use the <Code>create</Code> block for your primary subject and describe the rest of the scene in the <Code>set scene</Code> block.</p>
                <p>Let's create a scene of a hero confronting a dragon.</p>
                <CodeBlock>
{`// The hero is our focal point.
create person "female knight in silver armor" {
    action: "standing defiantly, sword raised";
    expression: "a determined glare";
}

// We add the dragon as a detail in the scene.
set scene "the mouth of a vast, treasure-filled cave" {
    details: "a colossal red dragon emerges from the darkness behind her, roaring";
    lighting: "the scene is lit by the glow of the hero's sword and piles of gold";
}

set style {
    type: "epic fantasy concept art";
}`}
                </CodeBlock>
                <p>By placing the dragon in the <Code>details</Code> property of the scene, you tell the AI it's a critical part of the background and composition, creating a dynamic relationship between the two subjects.</p>
                
                <SubSectionTitle id="adv-thinking">5.3: Thinking in Layers</SubSectionTitle>
                <p>To master ImageScript, stop thinking in sentences and start thinking in layers, like a digital artist or a filmmaker:</p>
                <ol>
                    <li><strong>Layer 1: The Subject.</strong> Who or What? Start with <Code>create</Code>. This is your anchor. What is the most important thing in your image? Define it first.</li>
                    <li><strong>Layer 2: The World.</strong> Where and When? Define the world with <Code>set scene</Code>. Give your subject a stage to exist on.</li>
                    <li><strong>Layer 3: The Aesthetic.</strong> How does it Look? Define the aesthetic with <Code>set style</Code>. Is it a photo? A painting? Who is the artist?</li>
                    <li><strong>Layer 4: The Lens.</strong> How is it Framed? If it's cinematic or photographic, use <Code>set camera</Code> to direct the shot.</li>
                    <li><strong>Layer 5: The Color Grade.</strong> How does it Feel? Use <Code>set palette</Code> to control the emotional impact of the colors.</li>
                </ol>

                <SectionTitle id="cook-photo">Chapter 6: The Cookbook</SectionTitle>
                <p>This chapter contains ready-to-use recipes for a variety of styles. Use them as-is or as a starting point for your own creations.</p>

                <SubSectionTitle id="cook-photoreal">Photorealistic Portrait</SubSectionTitle>
                <CodeBlock>
{`create person "woman with freckles and curly red hair" {
    description: "laughing, eyes closed, face tilted towards the sun";
    wearing: "a simple white linen shirt";
}
set scene "a field of wildflowers" {
    time_of_day: "golden hour, late afternoon";
    lighting: "warm, soft, backlit by the sun";
}
set style {
    type: "photograph";
    realism: "ultra-realistic, sharp details";
}
set camera {
    angle: "eye-level shot";
    lens: "85mm f/1.8 lens";
    focus: "sharp focus on her face, soft bokeh background";
    film_type: "shot on Kodak Portra 400, fine grain";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-noir">Cinematic Film Noir</SubSectionTitle>
                <CodeBlock>
{`create person "hardboiled 1940s detective" {
    wearing: "a fedora and trench coat";
    action: "lighting a cigarette in a dark alley";
    expression: "cynical, world-weary";
}
set scene "a rain-slicked city street at night" {
    atmosphere: "mysterious, dangerous";
    lighting: "harsh single light source from a streetlamp, deep shadows";
}
set style {
    type: "black and white photograph";
    genre: "film noir";
}
set camera {
    angle: "low angle, dutch tilt";
    film_type: "shot on high-contrast Ilford HP5 film";
}`}
                </CodeBlock>
                
                <SubSectionTitle id="cook-wes">Wes Anderson Style</SubSectionTitle>
                <CodeBlock>
{`create person "a quirky, melancholic bellhop" {
    wearing: "a perfectly tailored purple uniform";
    expression: "deadpan, staring directly at camera";
}
set scene "the lobby of a grand, eccentric, old hotel" {
    details: "everything is perfectly symmetrical";
    atmosphere: "nostalgic, whimsical";
}
set style {
    type: "cinematic film still";
    artist: "in the style of Wes Anderson";
}
set camera {
    composition: "perfectly centered, flat composition";
    lens: "anamorphic lens";
}
set palette {
    mood: "pastel, vintage colors";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-macro">Dramatic Macro Insect</SubSectionTitle>
                <CodeBlock>
{`create creature "jumping spider" {
    description: "covered in tiny water droplets";
    action: "peeking over a vibrant green leaf";
}
set style {
    type: "macro photograph";
    realism: "extreme detail, National Geographic quality";
}
set camera {
    angle: "extreme close-up";
    lens: "100mm macro lens";
    focus: "razor sharp focus on its large, iridescent eyes";
    lighting: "soft, diffused lighting from a ring flash";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-ukiyo">Ukiyo-e Woodblock Print</SubSectionTitle>
                <CodeBlock>
{`create person "a samurai warrior" {
    action: "standing on a cliff overlooking a stormy sea";
    wearing: "traditional armor";
}
set scene "a tempestuous ocean with massive waves" {
    details: "a silhouette of Mount Fuji in the far distance";
}
set style {
    type: "Japanese ukiyo-e woodblock print";
    artist: "in the style of Hokusai and Hiroshige";
    details: "bold outlines, flat areas of color, distinctive wave patterns";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-dali">Surrealist Dreamscape</SubSectionTitle>
                <CodeBlock>
{`create object "a melting clock" {
    action: "draped over the branch of a dead tree";
}
set scene "a vast, empty desert landscape under a strange sky" {
    details: "ants crawl over the clock; distant elephants have long, spindly legs";
    atmosphere: "dreamlike, bizarre, unsettling";
}
set style {
    type: "oil painting";
    artist: "in the style of Salvador Dali";
    realism: "hyperrealistic rendering of surreal objects";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-nouveau">Art Nouveau Poster</SubSectionTitle>
                 <CodeBlock>
{`create person "ethereal woman with long, flowing hair" {
    description: "hair is intertwined with flowers and vines";
    action: "posing gracefully";
}
set style {
    type: "art nouveau poster illustration";
    artist: "in the style of Alphonse Mucha";
    details: "elegant, organic lines, decorative patterns, ornate borders";
}
set palette {
    colors: "muted pastels, gold accents";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-ghibli">Ghibli-style Scene</SubSectionTitle>
                <CodeBlock>
{`create person "young girl with a straw hat" {
    action: "chasing butterflies in a lush meadow";
    wearing: "a simple summer dress";
}
set scene "a sun-drenched countryside" {
    location: "next to a sparkling, clear river";
    atmosphere: "peaceful, idyllic, nostalgic";
    time_of_day: "bright sunny afternoon, fluffy white clouds";
}
set style {
    type: "anime screenshot, background art";
    artist: "in the style of studio ghibli, hayao miyazaki, kazuo oga";
    realism: "hand-painted watercolor backgrounds";
}
set palette {
    colors: "vibrant greens and blues, warm yellows";
    mood: "joyful and heartwarming";
}`}
                </CodeBlock>
                
                <SubSectionTitle id="cook-fantasy">Epic Fantasy Landscape</SubSectionTitle>
                <CodeBlock>
{`create creature "colossal ancient dragon" {
    description: "scales like obsidian, molten gold running in cracks";
    action: "sleeping coiled around a mountain peak";
}
set scene "a stormy, desolate mountain range" {
    atmosphere: "epic, awe-inspiring, dangerous";
    weather: "lightning striking in the distance";
}
set style {
    type: "epic fantasy digital painting";
    artist: "in the style of greg rutkowski, tomasz jedruszek";
    realism: "masterpiece, hyperdetailed, trending on artstation";
}
set camera {
    angle: "dramatic low angle shot, emphasizing scale";
    lens: "ultra wide-angle lens";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-cyberpunk">Gritty Cyberpunk Alley</SubSectionTitle>
                <CodeBlock>
{`create person "cyborg detective" {
    description: "trench coat, glowing cybernetic eye, tired expression";
    action: "standing in the rain, looking down at the street";
}
set scene "a futuristic, dystopian metropolis" {
    atmosphere: "noir, gritty, oppressive";
    weather: "constant, heavy rain";
    lighting: "lit by towering holographic advertisements";
}
set style {
    type: "cinematic film still";
    artist: "inspired by blade runner, ridley scott";
    realism: "photorealistic, cinematic";
}
set camera {
    angle: "high angle shot, looking down";
    lens: "anamorphic lens, cinematic widescreen";
    focus: "rain drops on lens, lens flare";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-50s-scifi">Vintage Sci-Fi</SubSectionTitle>
                <CodeBlock>
{`create person "a 1950s astronaut in a silver suit" {
    wearing: "a fishbowl helmet";
    holding: "a ray gun";
}
set scene "a barren, red, alien planet with two suns" {
    details: "a classic flying saucer is parked in the background";
}
set style {
    type: "1950s science fiction book cover painting";
    artist: "in the style of Frank R. Paul";
    details: "pulpy, retrofuturistic, slightly aged paper texture";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-gothic">Gothic Horror</SubSectionTitle>
                <CodeBlock>
{`create creature "a terrifying vampire lord" {
    description: "gaunt face, piercing red eyes, long fangs";
    action: "materializing from shadows on a grand staircase";
}
set scene "a dilapidated gothic castle" {
    atmosphere: "dark, oppressive, filled with dread";
    lighting: "lit by candelabras and a full moon shining through a tall window";
}
set style {
    type: "horror illustration, oil painting";
    artist: "in the style of Beksinski and Dave McKean";
}
set palette {
    colors: "deep reds, blacks, and dark blues";
    contrast: "high contrast, chiaroscuro lighting";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-sticker">Die-Cut Sticker</SubSectionTitle>
                <CodeBlock>
{`create creature "cute cartoon avocado" {
    description: "smiling, winking, holding a small heart";
}
set style {
    type: "vector illustration, graphic art";
    details: "die-cut vinyl sticker with a thick white border, glossy finish";
    realism: "bold outlines, simple shading";
}
set palette {
    colors: "bright, friendly colors";
}`}
                </CodeBlock>
                
                <SubSectionTitle id="cook-lego">Lego Model</SubSectionTitle>
                <CodeBlock>
{`create vehicle "a classic 1960s sports car" {
    description: "made entirely of red, black, and white lego bricks";
}
set scene "a plain white studio background" {
    lighting: "bright, even studio lighting";
}
set style {
    type: "3D render";
    realism: "photorealistic render of lego bricks";
    details: "subtle seams between bricks, official lego logo on studs";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-blueprint">Technical Blueprint</SubSectionTitle>
                <CodeBlock>
{`create vehicle "a futuristic starship" {
    description: "showing different orthographic views (top, side, front)";
}
set style {
    type: "technical blueprint drawing";
    details: "white lines on a blue background, annotations, measurements, grid lines";
    genre: "engineering diagram";
}`}
                </CodeBlock>

                <SubSectionTitle id="cook-double">Double Exposure</SubSectionTitle>
                <CodeBlock>
{`create person "silhouette of a woman's profile" {
    description: "her form is filled with a starry night sky and galaxy";
}
set style {
    type: "photograph, double exposure effect";
    artist: "in the style of Dan Mountford";
    details: "creative, artistic, blending two images seamlessly";
}
set palette {
    colors: "deep blues, purples, and whites of the stars";
}`}
                </CodeBlock>

                <SectionTitle id="ref-commands">Chapter 7.1: Command Quick Reference</SectionTitle>
                <ul>
                    <li><Code>create {'<type>'} "{'name'}"</Code>: Defines the main subject. Types can be <Code>person</Code>, <Code>creature</Code>, <Code>object</Code>, <Code>vehicle</Code>, etc. Only the first one in the script is used.</li>
                    <li><Code>set scene "{'name'}"</Code>: Defines the environment and atmosphere.</li>
                    <li><Code>set style</Code>: Defines the artistic medium, artists, and overall aesthetic.</li>
                    <li><Code>set camera</Code>: Defines the virtual camera's properties for cinematic shots.</li>
                    <li><Code>set palette</Code>: Defines the color scheme and mood.</li>
                </ul>

                <SubSectionTitle id="ref-properties">7.2: Property Compendium</SubSectionTitle>
                <p>This is a non-exhaustive list of common properties. Feel free to invent your own; the AI is flexible and often understands novel descriptions!</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
                    <div>
                        <strong>Create Properties</strong>
                        <ul>
                            <li>description</li>
                            <li>action</li>
                            <li>wearing</li>
                            <li>holding</li>
                            <li>expression</li>
                            <li>pose</li>
                            <li>species</li>
                            <li>material</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Scene Properties</strong>
                        <ul>
                            <li>location</li>
                            <li>atmosphere</li>
                            <li>time_of_day</li>
                            <li>weather</li>
                            <li>lighting</li>
                            <li>details</li>
                            <li>era</li>
                            <li>flora</li>
                            <li>fauna</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Style Properties</strong>
                        <ul>
                            <li>type</li>
                            <li>artist</li>
                            <li>realism</li>
                            <li>details</li>
                            <li>genre</li>
                            <li>era</li>
                            <li>movement</li>
                            <li>texture</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Camera Properties</strong>
                        <ul>
                            <li>angle</li>
                            <li>lens</li>
                            <li>focus</li>
                            <li>film_type</li>
                            <li>composition</li>
                            <li>shot_type</li>
                            <li>effects</li>
                        </ul>
                    </div>
                     <div>
                        <strong>Palette Properties</strong>
                        <ul>
                            <li>colors</li>
                            <li>mood</li>
                            <li>contrast</li>
                            <li>saturation</li>
                            <li>temperature</li>
                            <li>harmony</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
      </div>
    </div>
  );
};

export default ImageScriptDocs;
