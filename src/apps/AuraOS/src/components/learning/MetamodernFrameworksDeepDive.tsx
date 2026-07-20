import React, { useState } from 'react';
import { useNavigationContext } from '../../../contexts/NavigationContext';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-lg border border-white/5 mb-3 ${open ? 'border-l-2 border-l-violet-500/60' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3 flex items-center justify-between bg-[#0a0a10]/80 rounded-lg hover:bg-white/[0.03] transition-colors"
      >
        <span className="text-slate-100 text-sm font-medium">{title}</span>
        <span className="text-slate-500 text-xs ml-3">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 bg-[#0a0a10]/80 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
};

interface SubSectionProps {
  title: string;
  children: React.ReactNode;
}

const SubSection: React.FC<SubSectionProps> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded border border-white/5 mb-2 ${open ? 'border-l-2 border-l-violet-400/40' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-3 py-2 flex items-center justify-between bg-white/[0.02] rounded hover:bg-white/[0.04] transition-colors"
      >
        <span className="text-slate-200 text-xs font-medium">{title}</span>
        <span className="text-slate-600 text-xs ml-2">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 bg-white/[0.02] rounded-b">
          {children}
        </div>
      )}
    </div>
  );
};

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-slate-300 text-sm leading-relaxed mb-3">{children}</p>
);

const PartHeader: React.FC<{ label: string; title: string }> = ({ label, title }) => (
  <div className="mt-8 mb-4 pt-4 border-t border-white/5">
    <p className="text-xs font-semibold tracking-widest text-violet-400/80 uppercase mb-1">{label}</p>
    <p className="text-slate-400 text-xs">{title}</p>
  </div>
);

export default function MetamodernFrameworksDeepDive() {
  const { setActiveTab } = useNavigationContext();

  return (
    <div className="min-h-screen bg-[#050508] text-slate-300">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 bg-[#050508]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('metamodern-bridge')}
          className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-slate-100 text-sm font-medium">Metamodern Frameworks</h1>
        <span className="text-slate-600 text-xs ml-auto">Full Academic Survey</span>
      </div>

      <div className="px-4 py-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-slate-100 text-lg font-semibold mb-1">Metamodern Frameworks</h2>
          <p className="text-slate-400 text-xs">Emerging Perspectives on Meaning, Crisis, and Civilizational Transition</p>
        </div>

        {/* PART I */}
        <PartHeader label="Part I" title="Foundations" />

        <Section title="1.1 Introduction: The Metamodern Moment" defaultOpen>
          <P>We are living through what many theorists now describe as a civilizational inflection point — an escalating series of interconnected crises, ecological, political, and social. Our illness is serious; it might even be terminal. The systems of global civilization risk collapse, resulting in large-scale destruction of life. These crises are not merely technical problems awaiting technical solutions; they emerge from the very worldview that created our modern institutions.</P>
          <P>Metamodern philosophy enters the scene only once the internet and social media have become truly dominant factors in people's lives, and when many of us no longer participate directly in the production and distribution of industrial goods. It is a worldview that combines modern faith in progress with postmodern critique. What results is a view of reality in which people are on a long, complex developmental journey toward greater complexity and existential depth.</P>
          <P>This essay provides a comprehensive survey of the major metamodern frameworks that have emerged to address this civilizational moment. While these frameworks differ in their emphases, methodologies, and disciplinary homes, they share a family resemblance: all seek to move beyond the impasse between modernist optimism and postmodern critique, and all recognize that both inner transformation — of consciousness, meaning, and values — and outer transformation — of institutions, systems, and structures — are necessary.</P>

          <SubSection title="1.1.1 Defining Metamodernism: Three Schools">
            <P>There are cultural theorists (like Vermeulen and van den Akker) who use metamodernism to speak primarily of developments in art and culture, for whom the label marks a distinct cultural period and "structure of feeling" (à la Raymond Williams). Some of them (Linda Ceriello and Greg Dember) also refer to it as an "episteme," or structure of knowing (à la Foucault). Other thinkers (like Freinacht and Andersen) speak of metamodernism as a stage in culture's continual "complexification" of symbolic "codes," incorporating postmodern insights while also transcending them. Still others (like Storm) propose metamodernism as a new philosophical "paradigm" offering fresh avenues for thought and research beyond the deconstructive methods now reaping diminishing returns in academia.</P>
            <P>The term "metamodernism" thus encompasses at least three distinct usages: (1) Cultural-aesthetic metamodernism — the "Dutch school" of Vermeulen and van den Akker — a descriptive analysis of emerging patterns in contemporary art and culture. (2) Developmental-political metamodernism — the "Nordic school" of Freinacht and Andersen — a normative framework proposing new forms of politics, education, and social organization. (3) Philosophical-academic metamodernism (Storm, Dempsey) — a rigorous metatheoretical project aimed at moving beyond postmodern deconstruction.</P>
            <P>Metamodernism can be understood as representing nothing less than a comprehensive worldview, one that constellates a particular world model and normative orientation according to relatively coherent principles. It is a worldview organized according to recursive transcendence through iterative self-reflection — a going meta after and beyond the postmodern — which naturally brings with it a given sensibility, philosophical project, and meaningful scientific metanarrative as necessary byproducts.</P>
          </SubSection>

          <SubSection title="1.1.2 The Oscillation Between Modernism and Postmodernism">
            <P>In 2010, cultural studies scholar Timotheus Vermeulen and philosopher Robin van den Akker published "Notes on Metamodernism" in the Journal of Aesthetics & Culture. They described the new sensibility as one that oscillates between aspects of modernism and postmodernism, with artworks and other cultural artifacts swinging between modern and postmodern polarities such as enthusiasm and irony, hope and melancholy, naïveté and knowingness, empathy and apathy, unity and plurality, totality and fragmentation, and purity and ambiguity.</P>
            <P>The use of the prefix meta here derives from Plato's metaxis, describing an oscillation and simultaneity between and beyond diametrically opposed poles. As Vermeulen and van den Akker put it, metamodernism's oscillation should not be thought of as a balance: "rather, it is a pendulum swinging between 2, 3, 5, 10, innumerable poles. Each time the metamodern enthusiasm swings toward fanaticism, gravity pulls it back toward irony; the moment its irony sways toward apathy, gravity pulls it back toward enthusiasm."</P>
            <P>This oscillatory quality — neither naively idealistic nor cynically ironic — characterizes the metamodern sensibility across all its manifestations.</P>
          </SubSection>
        </Section>

        <Section title="1.2 Historical Context: From Modernism Through Postmodernism">
          <P>To understand metamodernism, one must first understand the intellectual and cultural movements it responds to and seeks to transcend.</P>

          <SubSection title="1.2.1 Modernism: The Enlightenment Project">
            <P>Modernism is a mindset and cultural code that formed during the emergence of modern science and the Enlightenment — it has been operative for approximately three hundred years. It emphasizes reason and rationality, the power of science in deciphering foundational truths about the universe, capitalism, and the idea of human progress. It also emphasizes individuality and universal human rights. Most modern industrial societies are primarily organized by these values and codes.</P>
            <P>The modernist worldview is characterized by: epistemological confidence — belief that objective truth can be discovered through rational inquiry and the scientific method; progress narrative — faith that history moves toward greater human flourishing through technological and social advancement; universalism — the assumption that certain values, rights, and truths apply across all cultures and contexts; and instrumental rationality — the optimization of means to achieve ends, expressed through bureaucracy, industrialization, and technical expertise.</P>
            <P>Example: The United Nations' Universal Declaration of Human Rights (1948) exemplifies modernist assumptions — that there exist universal moral truths applicable to all humans regardless of culture, and that rational deliberation can identify and codify them.</P>
          </SubSection>

          <SubSection title="1.2.2 Postmodernism: The Critique of Grand Narratives">
            <P>Postmodernism arose primarily in the second half of the twentieth century. In direct contrast to modernism, the postmodern viewpoint offers a skeptical critique of modernist knowledge and concludes that knowledge is always contextual. The postmodern argument holds that truth is inevitably fused with social power.</P>
            <P>Emerging from thinkers such as Jacques Derrida, Michel Foucault, Jean-François Lyotard, and Jean Baudrillard, postmodernism offered systematic critiques of modernist assumptions: anti-foundationalism — rejection of claims to objective, universal truth; all knowledge is situated, partial, and shaped by power relations; deconstruction — an analytical method revealing hidden assumptions, binary oppositions, and power structures embedded in texts and institutions; skepticism toward metanarratives — Lyotard's famous definition of the postmodern as "incredulity toward metanarratives"; and identity politics — recognition that categories such as gender, race, and sexuality are socially constructed and sites of political struggle.</P>
            <P>For decades, scholars called into question the universality of disciplinary objects and categories. The coherence of defined autonomous categories — such as religion, science, and art — collapsed under the weight of postmodern critique, calling into question the possibility of progress and even the value of knowledge itself.</P>
          </SubSection>

          <SubSection title="1.2.3 The Exhaustion of Postmodernism">
            <P>Just as postmodernism arose when people became dissatisfied with modernism's certainty, metamodernism arose when people became exhausted by postmodernism's skepticism.</P>
            <P>By the early 2000s, a growing number of artists, intellectuals, and cultural observers noted that postmodernism had reached a dead end. Its critical tools were powerful for dismantling existing structures but offered little guidance for constructing alternatives. Having superseded modernism, postmodernism was itself in decline. The most influential ideas of postmodernism from the 1970s and 1980s had lost their purchase. Just as postmodernism was a rebellion against modernism, metamodernism began surfacing in the 2000s, striking a balance between the poles of modernism and postmodernism.</P>
            <P>Philosophically, metamodern advocates agree with many postmodern critiques of modernism (for example, on gender inequality) while contending that postmodern deconstruction and critical analytic strategies fall short in facilitating desired resolutions.</P>
            <P>The limitations of pure postmodernism became increasingly apparent in several domains: political paralysis — endless critique without constructive proposals left activists unable to articulate positive visions; meaning crisis — the deconstruction of all metanarratives left individuals without resources for existential orientation; relativism trap — treating all perspectives as equally valid made it difficult to condemn genuine injustice or ecological destruction; and climate emergency — the scale of ecological crisis demanded coordinated action that postmodern fragmentation could not supply.</P>
          </SubSection>
        </Section>

        {/* PART II */}
        <PartHeader label="Part II" title="Major Frameworks" />

        <Section title="1.3 Game B: Redesigning the Civilizational Operating System">
          <P>Game B emerged from conversations at the Santa Fe Institute beginning around 2008, crystallizing into its present form in 2012–2013. The principal architects include Jim Rutt (former Chair of the Santa Fe Institute), Jordan Hall (co-founder of Neurohacker Collective), and Daniel Schmachtenberger (founding member of the Consilience Project). Other early contributors included Eric Weinstein, Seb Pacquet, and Vanessa Miemis.</P>
          <P>Game B theorists use the term "Game A" to describe the current civilizational operating system — the aggregate of competitive, rivalrous dynamics that have characterized human societies since at least the Agricultural Revolution. Game A is characterized by rivalrous dynamics (zero-sum competition over resources, status, and power), externalization of costs, exponential technology, and coordination failures — inability to solve collective action problems despite shared knowledge of risks.</P>
          <P>Game B proposes an alternative civilizational mode characterized by non-rivalrous dynamics (positive-sum games where cooperation produces outcomes impossible through competition alone), collective intelligence, internalized externalities, and anti-fragility — structures that become stronger in response to stress rather than collapsing under it.</P>

          <SubSection title="Key Concepts">
            <P>Sovereignty: The capacity to take responsibility for one's own life and choices. Game B theorists argue that Game A induces learned helplessness — the belief that individuals have no genuine agency over their circumstances. Sovereignty is the recovery of that agency.</P>
            <P>Coherence: The capacity of groups to operate at high effectiveness through shared models, knowledge, vocabulary, and values embedded in trust. Coherence is proposed as a "Game B superpower" — the ability to coordinate without coercion.</P>
            <P>Infinite Games: Drawing on James Carse's Finite and Infinite Games (1986), Game B distinguishes between finite games (played to win) and infinite games (played to continue playing). The notion of infinite games has embedded itself deeply in the discourse of the Liminal Web.</P>
            <P>The Four Kinds of Knowing (via John Vervaeke): Propositional (knowing that), procedural (knowing how), perspectival (knowing what it is like), and participatory (knowing through relationship). Game B emphasizes that propositional knowledge alone is insufficient; wisdom requires the integration of all four.</P>
          </SubSection>

          <SubSection title="Example: Applying Game B Analysis">
            <P>Consider climate change negotiations. Game A analysis: Nations compete to minimize their own emissions reductions while maximizing economic advantage. Each actor rationally defects from cooperation because they bear the costs of reduction while benefits are distributed globally. Result: collective failure despite universal knowledge of the problem.</P>
            <P>Game B approach: Rather than trying to win the negotiation game, participants would work to develop shared models of the climate system; create transparency mechanisms that make defection costly and cooperation visible; design institutions where national interest aligns with planetary interest; and build sufficient trust — coherence — that coordination becomes possible without enforcement.</P>
          </SubSection>

          <SubSection title="Critiques and Limitations">
            <P>Critics of Game B raise several concerns: abstraction — the framework operates at a high level of abstraction, making concrete implementation unclear; utopianism — the vision may underestimate the depth of rivalrous dynamics in human nature; scale problem — while Game B principles may work at small scales (Dunbar-sized groups of roughly 150), scaling them to civilizational levels remains undemonstrated; and the transition problem — how to move from Game A to Game B without being outcompeted by Game A dynamics in the process.</P>
          </SubSection>
        </Section>

        <Section title="1.4 Political Metamodernism: Hanzi Freinacht and The Listening Society">
          <P>Hanzi Freinacht is the pen name used by author Emil Ejner Friis and sociologist Daniel Görtz, who published The Listening Society: A Metamodern Guide to Politics in 2017. Written as philosophical polemic, Freinacht plays into common metamodern themes — informed naïveté, ironic sincerity — through the performance of the author persona itself. The Hanzi Freinacht character is itself a metamodern artifact — a fictional philosopher with an inflated ego and grandiose claims, yet making substantively serious arguments.</P>
          <P>In The Listening Society, Freinacht attempts to describe how relationships between memetics (units of culture), epistemology, and developmental psychology are integral to comparative politics and a metamodern way of life. Freinacht's central insight is that politics is developmental — the quality of political outcomes depends on the developmental level of the citizens and institutions involved. A society cannot implement policies its members cannot cognitively or emotionally sustain.</P>

          <SubSection title="The Three Pillars of Political Metamodernism">
            <P>1. The Listening Society: A welfare system that addresses psychological and emotional needs, not just material ones. Traditional welfare provides food, shelter, healthcare, and education. The Listening Society adds systematic support for psychological growth, emotional processing, and existential development.</P>
            <P>2. Co-Development: A political stance that genuinely wants all citizens to succeed and develop, including political opponents. Rather than treating politics as zero-sum combat between factions, co-development seeks conditions under which everyone can grow.</P>
            <P>3. The Nordic Ideology: Six new forms of politics — Democratization Politics (deepening and expanding democratic participation), Gemeinschaft Politics (rebuilding community and social fabric), Existential Politics (addressing questions of meaning, death, and ultimate concern), Emancipation Politics (liberating individuals from unnecessary constraints), Empirical Politics (grounding policy in rigorous evidence), and Politics of Theory (systematically improving collective models and paradigms).</P>
          </SubSection>

          <SubSection title="The Developmental Model">
            <P>Freinacht draws on multiple developmental theories — Robert Kegan, Clare Graves and Spiral Dynamics, Michael Commons' Model of Hierarchical Complexity — to construct a multi-dimensional model of human development. This model includes cognitive complexity (the sophistication of one's thinking), cultural code (the symbolic meaning-system through which one interprets reality), subjective states (the range and depth of one's conscious experiences), and existential depth (accumulated life experience and confrontation with fundamental realities — suffering, death, meaning).</P>
            <P>According to Görtz, metamodernism is: a cultural phase; a developmental stage of society; a stage of personal development; an abstracted meta-meme; a philosophical paradigm; and a sociopolitical movement. Freinacht's work serves as a bridge between the cultural-aesthetic metamodernism of Vermeulen and van den Akker, the developmental psychology of Kegan and Commons, the integral theory of Ken Wilber, and the practical politics of Nordic social democracy.</P>
          </SubSection>
        </Section>

        <Section title="1.5 Nordic Bildung: Lene Rachel Andersen and Cultural Maturation">
          <P>Bildung is a German term with no precise English equivalent. It encompasses education, cultivation, formation, and inner development. The term originated in eighteenth-century German Romanticism and became central to Nordic educational philosophy. Andersen defines Bildung as moral and emotional maturity — the capacity to navigate complexity with wisdom, to hold multiple perspectives, and to act responsibly within community.</P>
          <P>Andersen's historical research, presented in The Nordic Secret (co-authored with Tomas Björkman), reveals that the transformation of Scandinavian countries from poor feudal societies to thriving democracies was driven not primarily by economic factors but by a massive educational movement. Beginning in the 1860s, Danish farmers established folkehøjskoler (folk high schools) — residential schools where young adults studied history, philosophy, literature, and civic engagement. This Bildung process expanded cognitive horizons, created shared narratives and national identity, developed capacities for democratic participation, and built social trust that later enabled cooperative institutions.</P>
          <P>Andersen distinguishes her concept of metamodernity from other versions of metamodernism. Most metamodern frameworks integrate only modern and postmodern cultural codes. Andersen proposes integrating four: Indigenous (connection to nature, cyclical time, participatory knowing, animism), Premodern (strong existential frameworks, community bonds, ritual, tradition), Modern (science, universal rights, democracy, individual autonomy, progress), and Postmodern (critique of power, recognition of context-dependence, pluralism, deconstruction).</P>

          <SubSection title="The Bildung Rose">
            <P>Andersen's Bildung Rose is a visual model mapping seven domains of human development: production and technology; aesthetics and art; ethics and morality; science and knowledge; narrative and meaning; power and politics; and emotion and relationship. Each domain can be understood through each of the four cultural codes, creating a seven-by-four matrix. Genuine Bildung involves development across all domains, while recognizing that different cultural codes offer different strengths in each.</P>
            <P>Example — Climate Education Through the Bildung Lens: The modern approach teaches climate science — data, models, projections — and appeals to rational self-interest. The Bildung approach integrates: Indigenous — experiential connection with local ecosystems; Premodern — engaging with existential dimensions — mortality, responsibility to future generations; Modern — rigorous scientific understanding; Postmodern — examining how power structures shape climate discourse. The goal is not mere information transfer but formation — developing humans capable of responding wisely to the crisis.</P>
          </SubSection>
        </Section>

        <Section title="1.6 John Vervaeke: The Meaning Crisis and Relevance Realization">
          <P>John Vervaeke, professor of cognitive science at the University of Toronto, is the most prominent theorist of the "meaning crisis." The crisis of wisdom, he holds, is the defining crisis of our times. To overcome it, we must learn to reclaim what has been lost in the cultural tradition. Vervaeke has published a fifty-part lecture series on YouTube, "Awakening from the Meaning Crisis," which attracted up to 150,000 viewers worldwide.</P>
          <P>Vervaeke traces the meaning crisis through Western history. In the Hellenistic Axis period — an early form of globalization — he identifies an early case of "domicide," the murder of home, as local, small-scale cultures found their old myths unable to make sense in a new world. Out of this crisis arose the Axial Revolution, which gave birth to the wisdom traditions of the great world religions. This "two-world" mythology provided frameworks for self-transcendence for two millennia. Its collapse — through the Scientific Revolution, the Enlightenment, and secularization — left a vacuum. Modern secular society emphasizes propositional knowledge (knowing that) at the expense of other forms of knowing, leaving us information-rich but wisdom-poor.</P>

          <SubSection title="The Cognitive Scientific Framework">
            <P>Relevance Realization: The dynamic cognitive machinery that determines what is relevant from a combinatorially explosive set of possibilities. Every moment presents infinite possible information, interpretations, and actions. The brain must rapidly determine what matters, what to attend to, what to ignore. This process is largely unconscious, automatic, and constitutive of meaning-making itself.</P>
            <P>The Four Ps of Knowing: Propositional — knowing that (facts, beliefs, assertions); Procedural — knowing how (skills, competencies); Perspectival — knowing what it is like (salience, situatedness); Participatory — knowing through relationship (identity, co-creation). Modern education overemphasizes propositional knowing while neglecting the others.</P>
          </SubSection>

          <SubSection title="Ecology of Practices">
            <P>What is needed to awaken from the meaning crisis is, in part, the re-establishment of a fully secular ecology of practices — a re-engineering of enlightenment — capable of addressing the perennial problems that provoke meaninglessness. The practices must be secular, because we can no longer occupy a two-worlds mythos; our realities have converged on a single natural world.</P>
            <P>An ecology of practices is a mutually reinforcing set of activities — meditation, contemplation, dialogue, embodiment work, philosophical inquiry — that together cultivate wisdom. No single practice suffices; they must be integrated and balanced. Vervaeke's concept parallels Alasdair MacIntyre's argument that virtues require practices and traditions. The meaning crisis is partly a crisis of practices and traditions.</P>
          </SubSection>
        </Section>

        <Section title="1.7 Daniel Schmachtenberger: The Metacrisis and Civilizational Risk">
          <P>The metacrisis names the total ecosystem of global crises and the common underlying dynamics that generate catastrophic and existential risks. As Schmachtenberger puts it: "The Metacrisis is not many crises happening at once — it is the pattern behind them all." The metacrisis is distinct from the polycrisis (Edgar Morin's term for many crises occurring simultaneously). The metacrisis points to shared structural causes that generate multiple surface-level crises.</P>
          <P>Schmachtenberger identifies several "generator functions" — underlying dynamics that reliably produce crises: (1) Rivalrous dynamics plus exponential technology — when competitive actors gain access to increasingly powerful technologies, the stakes of competition escalate toward catastrophic or existential risk; (2) Externality generation — economic systems that allow actors to profit by imposing costs on others inevitably degrade the commons; (3) Information ecology degradation — when media systems optimize for engagement over truth, collective sensemaking deteriorates; (4) Asymmetric power and misaligned incentives — when power concentrates while accountability diffuses, those who cause harm do not bear proportionate consequences.</P>

          <SubSection title="The Three Attractors">
            <P>Schmachtenberger's framework identifies three "attractors" toward which current dynamics tend: (1) Catastrophe — existential risk from nuclear war, engineered pandemics, AI systems failure, or ecological collapse; (2) Dystopia — totalitarian control enabled by surveillance technology — a world that "solves" coordination problems through centralized power; (3) Third attractor — a genuinely new form of civilization that neither collapses nor becomes totalitarian.</P>
            <P>Moving toward the third attractor requires addressing all generator functions simultaneously. Partial solutions that leave other dynamics intact will fail or backfire. The Consilience Project aims to improve collective sensemaking — the capacity of populations to understand their situation accurately and make informed decisions.</P>
          </SubSection>
        </Section>

        <Section title="1.8 Bonnitta Roy: Process Philosophy and Going Meta">
          <P>Bonnitta Roy is a philosopher, educator, and contemplative practitioner whose work bridges process philosophy, developmental theory, and metamodern thought. Her framework draws on Alfred North Whitehead's process philosophy and Jean Gebser's structures of consciousness. Roy derives a process model of metaphysics that interweaves Gebser's notion of the mental structure of consciousness with a deeper understanding of the dialectical differences between Western synthetic approaches and Eastern deconstructive approaches.</P>
          <P>Roy addresses a fundamental challenge facing all metamodern frameworks: the infinite regress problem. Every time we "go meta" — stepping back to observe a system — we create a new system that includes ourselves as observers. Traditional approaches try to resolve this by positing a privileged observer position (objectivism), denying the possibility of meta-knowledge (relativism), or constructing ever-more-complex metamodels — which leads to the "escalating epistemic complexity" Roy critiques.</P>
          <P>Roy proposes that the way out is not more modeling but a different mode of engaging — a process praxis that is participatory, embodied, and immanent rather than transcendent. Rather than standing outside systems to observe them, we cultivate the capacity to be present within processes as they unfold.</P>

          <SubSection title="Key Concepts and Six Ways to Go Meta">
            <P>Pan-experientialism: Drawing on Whitehead, the view that experience is fundamental to reality at all scales, not merely a human phenomenon. This "re-enchants" the world without recourse to supernatural claims. Downward causation: The capacity for higher-level patterns to constrain and guide lower-level processes, allowing for agency and meaning without requiring substance dualism. Simplexity: Finding simple generative patterns that produce complex behavior — the opposite of building ever-more-complex models.</P>
            <P>Roy outlines six modalities for going meta productively: (1) Meta-synthesis — integrating multiple theories into higher-order frameworks; (2) Orthogonal approaches — changing fundamental assumptions; (3) Simplexity — seeking generator functions and simple heuristics; (4) Holistic participation — embodied practices for expanded awareness; (5) Critical systems thinking — examining hidden assumptions and power dynamics; (6) Contemplative inquiry — using meditation and phenomenology to access pre-conceptual experience.</P>
          </SubSection>
        </Section>

        {/* PART III */}
        <PartHeader label="Part III" title="The Connective Tissue" />

        <Section title="1.9 The Liminal Web: Mapping an Emergent Ecosystem">
          <P>The Liminal Web is a phrase crafted by writer Joe Lightfoot to capture the overlapping spirit of communities such as Game B, Integral Theory, Metamodernism, the Stoa, Future Thinkers, and the Intellectual Deep Web. The word "liminal" (from Latin limen, threshold) refers to in-between states, thresholds, transitions. It is an apt description for a network of communities all working at the edge of the current paradigm, sensing that something new is emerging without yet being able to name it precisely.</P>
          <P>Formative to the space during this period were Jonathon Rowson and Tomas Björkman launching Perspectiva in 2016 and Metamoderna publishing The Listening Society in 2017. Major nodes include: think tanks such as Perspectiva (London), the Consilience Project, and Nordic Bildung (Copenhagen); media platforms such as The Stoa, Rebel Wisdom, The Jim Rutt Show, Future Thinkers, and Emerge; and residential communities such as Life Itself and the Monastic Academy.</P>
          <P>The most basic common denominator is the belief that social change should be paradigmatic, integrated — inner and outer transformation must go hand in hand — and engaged. Emerging commonalities include post-individualism, holism, and culture-making in the form of new norms and narratives. There is also a shared focus on complexity, systems and emergence, developmental models, spirituality and practice, and on sensemaking.</P>
          <P>The ecosystem is currently vague, complex, and sprawling. Names associated with it include Integral, Metamodern, Regenerative, Metacrisis-aware, Liminal Web, Game B, and more. It has no clear name, language, or shared identity. This makes it hard to discuss both within the ecosystem and especially with those outside it, which in turn makes effective collective action more difficult.</P>
        </Section>

        <Section title="1.10 Proto-B Practice Fields: From Theory to Embodiment">
          <P>All the frameworks discussed thus far face a common challenge: they remain largely theoretical. Ideas about new civilizational modes, developmental politics, or ecologies of practice must eventually be lived to be tested and refined. Proto-Bs are experimental communities that attempt to embody Game B principles in daily life. The term "Proto-B" indicates that these are prototypes — experiments rather than finished models.</P>
          <P>Proto-Bs operate on several key principles: Dunbar scale — communities are sized at or below Dunbar's number (roughly 150) to maintain coherent social relationships without bureaucratic mediation; experimental humility — each Proto-B is a probe into a high-dimensional design space; whole-system design — a Proto-B integrates multiple domains — governance, economics, education, parenting, conflict resolution, food systems; and cross-pollination — Proto-Bs communicate with each other and with the broader community to share learnings.</P>
          <P>Proto-Bs experiment with governance forms beyond both top-down hierarchy and pure consensus: consent-based decision-making (proposals proceed unless someone has a principled objection), Sociocracy/Holacracy (role-based governance with distributed authority), and liquid democracy (delegated voting where individuals can choose to vote directly or delegate on specific issues).</P>
          <P>Consider a hypothetical Proto-B of thirty households in a small town: members contribute to a shared fund, weekly circle meetings use consent-based process, children learn through a combination of homeschool cooperative and apprenticeship, members commit to shared contemplative practices, and the community participates in broader civic life while building an alternative social fabric alongside it.</P>
        </Section>

        {/* PART IV */}
        <PartHeader label="Part IV" title="Synthesis and Assessment" />

        <Section title="1.12 Cross-Cutting Themes">
          <P>Despite their differences, the metamodern frameworks share several characteristic features.</P>
          <P>Integration of Modernism and Postmodernism: All frameworks seek to honor both modernist accomplishments (science, universal rights, progress) and postmodern critiques (situated knowledge, power analysis, pluralism) without reducing either to the other. The idea is to "transcend and include" modernism and postmodernism. Metamodernism is what results when we take the strategies associated with postmodernism and productively turn them back on themselves — producing a genealogy of genealogies, deconstructing deconstruction.</P>
          <P>Developmental Orientation: All frameworks embrace some form of developmental thinking — the idea that individuals, cultures, and civilizations can mature through stages of increasing complexity, integration, and wisdom. This distinguishes them from both traditional conservatism (which denies meaningful progress) and naïve progressivism (which assumes development is automatic or linear).</P>
          <P>Inner and Outer Transformation Together: The most basic common denominator is the belief that social change should be paradigmatic, integrated, and engaged. External systems change requires internal development; internal development requires supportive external conditions. Neither alone is sufficient.</P>
          <P>Complexity-Informed: The frameworks draw on complexity science, systems thinking, and emergence. They reject both reductionism (everything can be explained by simpler components) and holistic mysticism (the whole is ineffable). Instead, they seek to understand how complex adaptive systems behave and how to intervene wisely within them.</P>
          <P>Sincere Irony: A distinctive metamodern sensibility is the combination of deep sincerity with ironic self-awareness. Grand visions are pursued earnestly and held lightly. This is neither modernist naïveté nor postmodern cynicism but something genuinely new. As Vermeulen and van den Akker put it, metamodernism "can be conceived of as a kind of informed naivety, a pragmatic idealism."</P>
        </Section>

        <Section title="1.13 Critiques and Limitations">
          <P>Elitism Concerns: Critics argue that metamodern frameworks are accessible primarily to educated, privileged populations. The language is often dense, the ideas require extensive background, and participation in the Liminal Web requires time and resources many lack. Counter-argument: Proponents suggest that any vanguard movement necessarily begins with early adopters; the question is whether the frameworks can eventually become more accessible.</P>
          <P>Abstraction Without Implementation: Many critiques note that metamodern frameworks remain theoretical. Game B has been discussed for over a decade without producing civilizational change; Proto-Bs remain small experiments. Counter-argument: Paradigm shifts take time; expecting rapid implementation may reflect the very impatience the frameworks critique.</P>
          <P>Eurocentrism: The frameworks draw heavily on Western philosophical traditions. While some incorporate Eastern contemplative traditions, indigenous knowledge systems are often mentioned but not deeply engaged. Counter-argument: Andersen's metamodernity explicitly integrates indigenous cultural code; others acknowledge this as an area requiring further development.</P>
          <P>Developmental Hierarchies as Problematic: Postmodern critics argue that developmental stage models can be used to rank people or cultures, justifying paternalism or colonialism. Counter-argument: Proponents distinguish between levels (temporary positions along a developmental path all traverse) and worth (which is equal at all levels).</P>
          <P>Unfalsifiability: Some critics argue that metamodern frameworks are unfalsifiable — that any evidence can be interpreted to fit the framework. Counter-argument: This critique applies to many metatheoretical frameworks. The appropriate standard may not be Popperian falsification but pragmatic usefulness and coherence.</P>
        </Section>

        <Section title="1.14 Future Directions">
          <P>Empirical Research: While metamodern frameworks draw on developmental psychology and cognitive science, more rigorous empirical work is needed. Can claims about meaning-making, developmental stages, or collective intelligence be operationalized and tested?</P>
          <P>Cross-Framework Integration: Works like Brendan Graham Dempsey's Metamodernism: Or, The Cultural Logic of Cultural Logics attempt synthesis. The goal is to offer a new and unique theory of metamodernism — one that can also act as a synthesis of its prior articulations, with greater explanatory power that reveals new levels of relationality, allowing us to track metamodern developments in the arts, philosophy, science, religion, and beyond.</P>
          <P>Engagement with Power: Metamodern frameworks often emphasize consciousness, meaning, and culture while underemphasizing political economy and power structures. Future development should engage more seriously with how existing power arrangements would resist or co-opt metamodern proposals.</P>
          <P>Non-Western Perspectives: In recent years, Germane Marvel has developed black metamodernism as "an emerging approach to clarifying, enriching and grounding the metamodern project," drawing philosophically on Vernon J. Dixon's concept of "diunital thinking." More such projects are needed to diversify and deepen the metamodern conversation.</P>
          <P>Institutional Instantiation: How might metamodern insights inform the design of actual institutions — universities, governance bodies, economic systems, media organizations? Moving from framework to institution is the critical next step.</P>
        </Section>

        <Section title="1.15 Conclusion: Toward a Second Renaissance">
          <P>Views and values can change. The deep stories that shape civilization have evolved throughout history. New paradigms can emerge that transcend old ideas and offer responses to the problems and limitations of the old world. Yet this is also a time of crisis. There may be darkness before dawn. Global crises indicate that modern civilization is in decline. Some level of societal collapse may even be likely. Breakdown can be a precursor to deep cultural transformation — modernity itself was born out of civilizational collapse in Europe at the end of the medieval period, leading to the first Renaissance, a period of great cultural rebirth.</P>
          <P>These metamodern frameworks offer no guarantees. They may prove inadequate to the challenges we face; they may be co-opted, distorted, or forgotten. But they represent a serious, sustained effort by a diverse array of thinkers to address the deepest questions of our time: How do we make meaning in a disenchanted world? How do we coordinate at civilizational scale without collapsing into dystopia? How do we mature as individuals and cultures to meet the complexity of our situation?</P>
          <P>Much is yet to emerge. But what kind of views and values might underpin a wiser, healthier world? Inner growth prioritized over material growth; recognition of our potential to evolve consciously — personally and collectively — in multiple dimensions: to wake up, grow up, clean up, and show up. A renewed cultivation of wisdom grounded in recognition of the limits and value of reason, the importance of the whole, and the value of a long view that includes all of the living.</P>
          <P>The invitation of metamodern thought is not to passively await a better future but to participate in its emergence — through practice, community, inquiry, and action.</P>
        </Section>

        {/* Appendices */}
        <PartHeader label="Appendices" title="Extended Analysis" />

        <Section title="Appendix A: Political Polarization Through Three Metamodern Lenses">
          <P>Standard analyses of political polarization typically focus on media effects (filter bubbles, algorithmic amplification), political strategy, demographic sorting, and economic factors. These analyses are not wrong, but they tend to treat polarization as a problem to be solved through better information, institutional reform, or political will. Metamodern frameworks reveal deeper structural and developmental dimensions that conventional approaches miss.</P>

          <SubSection title="Vervaeke's Meaning Crisis Framework">
            <P>Polarization is not primarily an information problem but a meaning problem. When people lack robust frameworks for existential orientation — purpose, belonging, self-transcendence — they become vulnerable to ideological capture. Political identity fills the void left by declining religious participation, community erosion, and the collapse of shared narratives. Partisan affiliation provides participatory knowing (a tribe to belong to), perspectival knowing (a lens that makes the world legible), and procedural knowing (scripts for how to act, whom to trust).</P>
            <P>The problem is that political ideology is a poor substitute for genuine meaning-making. It offers the form of meaning — identity, purpose, community — without the depth — self-transcendence, wisdom, transformation. Addressing polarization requires rebuilding ecologies of practice — communities and traditions that cultivate genuine meaning through contemplative practice, philosophical inquiry, and transformative relationship.</P>
          </SubSection>

          <SubSection title="Schmachtenberger's Metacrisis Framework">
            <P>Polarization is a generator function output, not an isolated problem. It emerges predictably from deeper structural dynamics: information ecology degradation (media systems optimized for engagement systematically amplify outrage and tribal identification); rivalrous dynamics plus exponential technology (social media weaponizes ancient tribal psychology at unprecedented scale); asymmetric accountability (those who benefit from polarization bear few consequences); and sensemaking collapse (when information systems degrade, populations lose the capacity to form accurate shared models of reality).</P>
            <P>Polarization cannot be solved in isolation because it is structurally coupled to other crises. Effective intervention requires redesigning incentive structures so that the interests of information platforms, political actors, and citizens align. This is a civilizational design problem, not a policy tweak.</P>
          </SubSection>

          <SubSection title="Freinacht's Political Metamodernism">
            <P>Polarization reflects a developmental mismatch between the complexity of contemporary problems and the meaning-making capacities of the population. Different developmental stages process political reality differently: Traditional/mythic — politics as sacred narrative; my group is righteous, opponents are evil. Modern/rational — politics as interest negotiation. Postmodern/pluralistic — politics as power critique. Metamodern/integral — politics as developmental project; how do we create conditions for everyone to grow?</P>
            <P>Polarization is partly a failure of psychological development at civilizational scale. Conflicts between people operating from fundamentally different developmental logics cannot be resolved through argument, evidence, or compromise — these tools presuppose shared logic. Long-term depolarization requires investing in human development — genuine Bildung that cultivates emotional regulation, perspective-taking, and cognitive complexity.</P>
          </SubSection>
        </Section>

        <Section title="Appendix B: Critiques and Proponent Responses (Extended)">
          <SubSection title="Critique 1: Elitism">
            <P>Metamodern frameworks are accessible primarily to educated, privileged, English-speaking populations. The language is often dense and jargon-heavy. Furthermore, developmental stage models can imply that those at "higher" stages are superior, justifying paternalism toward the "less developed."</P>
            <P>Proponent Response: Any paradigm shift begins with early adopters before diffusing more broadly. The printing press initially served elites; literacy eventually became universal. Folk high schools (Bildung) deliberately targeted rural farmers; Vervaeke's YouTube lectures reach hundreds of thousands; Game B podcasts have broad audiences. Developmental models describe capacities, not worth. A child is not worth less than an adult. Moreover, development is not linear superiority: later stages can lose capacities earlier stages possessed, such as spontaneity, embodiment, and community embeddedness.</P>
          </SubSection>

          <SubSection title="Critique 2: Abstraction Without Implementation">
            <P>Game B has been discussed for over a decade without producing civilizational change. Proto-Bs remain tiny experiments. The Listening Society does not exist. Metamodern frameworks excel at diagnosis and vision but fail at implementation. Meanwhile, conventional approaches — policy reform, organizing, electoral politics — actually change things, however imperfectly.</P>
            <P>Proponent Response: Paradigm shifts operate on generational timescales. The Enlightenment took centuries to reshape institutions. The theory/practice dichotomy is false — theory without practice is empty; practice without theory is blind. Conventional political engagement often fails precisely because it lacks adequate diagnosis. Climate activism has achieved little despite decades of effort — perhaps because it operates within assumptions that are part of the problem. Proto-Bs, intentional communities, and alternative institutions do exist, even if small.</P>
          </SubSection>

          <SubSection title="Critique 3: Eurocentrism">
            <P>Metamodern frameworks draw overwhelmingly on Western philosophical traditions. When Eastern traditions are included, they are often filtered through Western interpretive frameworks. Indigenous knowledge systems are mentioned but rarely deeply engaged. This is problematic both epistemically (missing crucial insights) and ethically (reproducing colonial patterns).</P>
            <P>Proponent Response: The critique is partially valid but overstated. Andersen's metamodernity explicitly includes indigenous cultural code. Vervaeke draws extensively on Buddhist epistemology. Roy engages with Eastern philosophy as an equal dialogue partner. Germane Marvel's "Black Metamodernism" draws on Vernon Dixon's "diunital thinking" and African philosophical traditions. The critique is best understood as a call for expansion, not rejection. Genuine integration of non-Western perspectives cannot be accomplished by adding diverse citations — it requires transformed epistemology.</P>
          </SubSection>

          <SubSection title="Critique 4: Unfalsifiability">
            <P>Metamodern frameworks are unfalsifiable. Any evidence can be interpreted to fit: polarization? Meaning crisis. Climate inaction? Metacrisis generator functions. Criticism of the framework? The critic is at an earlier developmental stage. Without clear criteria for falsification, the frameworks are not scientific but ideological.</P>
            <P>Proponent Response: Metamodern frameworks are metatheories — frameworks for organizing and relating other theories. The relevant standard is not falsifiability but coherence, comprehensiveness, and pragmatic usefulness. While the overarching frameworks may not be falsifiable, many specific claims within them are testable. Developmental stage models make predictions about cognitive capacities. Claims about information ecology effects are empirically investigable.</P>
          </SubSection>

          <SubSection title="Critique 5: Quietism and Political Naïveté">
            <P>By emphasizing inner transformation, meaning-making, and developmental growth, metamodern frameworks distract from urgent political action. While metamodernists meditate and dialogue, real power continues to concentrate, ecosystems collapse, and authoritarianism advances. The frameworks may even serve ruling interests by channeling potential dissent into introspective practices.</P>
            <P>Proponent Response: Inner and outer transformation are not alternatives but mutually necessary. Activists who burn out, movements that fragment, revolutions that reproduce the oppressions they opposed — these failures stem from neglecting inner development. Schmachtenberger's entire metacrisis analysis is about power — how it concentrates, how it generates risk, how current structures cannot self-correct. The frameworks counsel strategic patience — moving quickly where clarity exists, moving carefully where it does not.</P>
          </SubSection>
        </Section>

        <Section title="Glossary">
          <P>AQAL: "All Quadrants, All Levels, All Lines, All States, All Types" — Ken Wilber's shorthand for the complete Integral framework.</P>
          <P>Bildung: German concept encompassing education, inner development, cultivation, and moral maturation; central to Nordic educational philosophy.</P>
          <P>Co-development: Hanzi Freinacht's term for a political stance that genuinely wants all citizens to succeed and develop, including political opponents.</P>
          <P>Ecology of practices: John Vervaeke's term for a mutually reinforcing set of practices — meditation, contemplation, dialogue, and others — that together cultivate wisdom.</P>
          <P>Four Quadrants: Wilber's model dividing reality into interior-individual, exterior-individual, interior-collective, and exterior-collective dimensions.</P>
          <P>Game A: The current civilizational operating system, characterized by rivalrous, zero-sum dynamics.</P>
          <P>Game B: A proposed alternative civilizational mode based on non-rivalrous cooperation and collective intelligence.</P>
          <P>Generator functions: In metacrisis theory, the underlying structural dynamics that produce multiple surface-level crises.</P>
          <P>Liminal Web: The informal network of thinkers, platforms, and communities engaged with metamodern ideas.</P>
          <P>Listening Society: Freinacht's vision of a welfare system that addresses psychological and emotional needs, not just material ones.</P>
          <P>Metacrisis: The total ecosystem of global crises and the common underlying dynamics that generate them; distinct from "polycrisis" (multiple simultaneous crises).</P>
          <P>Metamodernism: Variously defined as a cultural sensibility, philosophical paradigm, or developmental stage that moves beyond the impasse of modernism and postmodernism.</P>
          <P>Metaxy: Platonic term for "in-betweenness"; the etymological root of the "meta-" in "metamodernism."</P>
          <P>Process philosophy: Philosophical tradition (associated with Whitehead) emphasizing becoming over being, relationship over substance.</P>
          <P>Proto-B: Experimental community attempting to embody Game B principles.</P>
          <P>Relevance realization: John Vervaeke's term for the cognitive process by which the mind determines what is meaningful and worthy of attention.</P>
          <P>Sincere irony: The characteristically metamodern combination of earnest commitment with self-aware playfulness.</P>
          <P>Sovereignty: In Game B discourse, the capacity to take responsibility for one's own life and act with genuine agency.</P>
        </Section>

        <Section title="Further Reading">
          <P>Game B and Metacrisis: Schmachtenberger, D. — Various lectures and interviews available at civilizationemerging.com. Rutt, J. — The Jim Rutt Show podcast (ongoing).</P>
          <P>Political Metamodernism: Freinacht, H. (2017). The Listening Society: A Metamodern Guide to Politics, Book One. Metamoderna. Freinacht, H. (2019). Nordic Ideology: A Metamodern Guide to Politics, Book Two. Metamoderna.</P>
          <P>Nordic Bildung: Andersen, L.R. and Björkman, T. (2017). The Nordic Secret: A European Story of Beauty and Freedom. Fri Tanke. Andersen, L.R. (2020). Metamodernity: Meaning and Hope in a Complex World. Nordic Bildung.</P>
          <P>Meaning Crisis: Vervaeke, J. — "Awakening from the Meaning Crisis" (50-part YouTube lecture series). Vervaeke, J., Mastropietro, C., and Miscevic, F. (2017). Zombies in Western Culture: A Twenty-First Century Crisis. Open Book Publishers.</P>
          <P>Integral Theory: Wilber, K. (1995). Sex, Ecology, Spirituality: The Spirit of Evolution. Shambhala. Wilber, K. (2000). A Theory of Everything. Shambhala. Wilber, K. (2006). Integral Spirituality. Shambhala.</P>
          <P>Process Philosophy: Roy, B. — Various papers and presentations at bonnittaroy.com. Whitehead, A.N. (1929). Process and Reality. Macmillan.</P>
          <P>Metamodernism (Cultural/Academic): Vermeulen, T. and van den Akker, R. (2010). "Notes on Metamodernism." Journal of Aesthetics and Culture, 2(1). Storm, J.A.J. (2021). Metamodernism: The Future of Theory. University of Chicago Press. Dempsey, B.G. (2023). Metamodernism: Or, The Cultural Logic of Cultural Logics.</P>
          <P>Secondary Sources: Turner, L. (2011). "The Metamodernist Manifesto." metamodernism.com. Lightfoot, J. (2021). "The Liminal Web: Mapping an Emergent Subculture." joelightfoot.org.</P>
          <P>Platforms and Communities: Emerge — whatisemerging.com. Perspectiva — systems-souls-society.com. The Stoa — thestoa.ca. Metamoderna — metamoderna.org. Second Renaissance — secondrenaissance.net.</P>
        </Section>

        <div className="mt-8 pb-12 text-center">
          <p className="text-slate-600 text-xs">End of survey</p>
        </div>
      </div>
    </div>
  );
}
