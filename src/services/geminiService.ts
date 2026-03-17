import { GoogleGenAI, Type } from "@google/genai";

export interface WorkoutExercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
  videoUrl?: string;
  imageUrl?: string;
  recommendedWeight?: string;
  musclesWorked?: string[];
  instructions?: string[];
  exerciseTips?: string[];
  equipments?: string[];
  overview?: string;
}

export interface Workout {
  title: string;
  muscleGroup: string;
  level: string;
  exercises: WorkoutExercise[];
  tips: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface FoodAnalysis {
  foodItems: string[];
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  tips: string;
}

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Analise esta imagem de um prato de comida ou alimento.
  Identifique os alimentos presentes e faça uma estimativa dos macronutrientes (Proteínas, Carboidratos, Gorduras em gramas) e das Calorias totais.
  Forneça também uma dica curta se essa refeição é boa para hipertrofia ou emagrecimento.
  Retorne um JSON estrito:
  {
    "foodItems": ["Arroz", "Feijão", "Frango"],
    "totalCalories": 450,
    "macros": {
      "protein": 40,
      "carbs": 50,
      "fats": 10,
      "fiber": 5,
      "sugar": 2
    },
    "tips": "Ótima refeição para hipertrofia, rica em proteínas magras."
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            totalCalories: { type: Type.NUMBER },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER },
                fiber: { type: Type.NUMBER },
                sugar: { type: Type.NUMBER }
              },
              required: ["protein", "carbs", "fats", "fiber", "sugar"]
            },
            tips: { type: Type.STRING }
          },
          required: ["foodItems", "totalCalories", "macros", "tips"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Food analysis error:", error);
    throw new Error("Erro ao analisar a comida.");
  }
}

export async function moderateImage(base64Image: string): Promise<{ safe: boolean; reason?: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Analise esta imagem de um treino de academia. 
  A imagem deve ser postada em uma comunidade fitness.
  REGRAS:
  1. Não pode conter nudez ou ser excessivamente vulgar/sexualizada.
  2. Deve ser relacionada a academia, exercícios, progresso físico ou ambiente de treino.
  3. Se a imagem for apenas uma pessoa em roupas de treino (top, legging, sem camisa) de forma esportiva, é PERMITIDO.
  4. Se for vulgar, sexualmente sugestiva ou ofensiva, bloqueie.
  
  Retorne um JSON:
  {
    "safe": true ou false,
    "reason": "Explicação curta se for bloqueada"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ["safe"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Moderation error:", error);
    return { safe: false, reason: "Erro ao analisar imagem." };
  }
}

export async function chatWithCoach(messages: ChatMessage[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const systemInstruction = `Você é o "IronPulse Coach", um especialista em musculação, nutrição esportiva e mundo fitness.
  Sua missão é ajudar os usuários com treinos, dietas e motivação.
  
  REGRAS CRÍTICAS:
  1. Responda APENAS sobre assuntos relacionados a: academia, musculação, esportes, nutrição, suplementação, saúde física e motivação fitness.
  2. Se o usuário perguntar qualquer coisa fora desse universo (política, fofoca, programação, receitas de bolo não-fitness, etc), responda educadamente: "Desculpe, mas como seu Coach IronPulse, meu foco é apenas em sua jornada fitness. Vamos falar sobre seu treino ou dieta?"
  3. Seja motivador, técnico e direto.
  4. Use termos de academia brasileiros (bulking, cutting, shape, reps, sets, etc).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction
      }
    });

    return response.text || "Desculpe, tive um problema ao processar sua resposta.";
  } catch (error) {
    console.error("Chat error:", error);
    return "O Coach está ocupado no momento. Tente novamente em breve!";
  }
}

export async function getExerciseMedia(exerciseName: string): Promise<{videoUrl: string, imageUrl: string, instructions?: string[], exerciseTips?: string[], overview?: string}> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Busque na internet informações detalhadas sobre o exercício de musculação: "${exerciseName}".
  Tente encontrar dados compatíveis com a API https://exercisedbv2.ascendapi.com.
  
  REGRAS CRÍTICAS:
  1. O vídeo deve ser um link DIRETO do YouTube (ex: https://www.youtube.com/watch?v=...).
  2. A imagem deve ser um link direto (JPG/PNG).
  3. Inclua instruções passo a passo e dicas de execução.
  4. Retorne um JSON com as chaves: "videoUrl", "imageUrl", "instructions", "exerciseTips", "overview".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            videoUrl: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            exerciseTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            overview: { type: Type.STRING }
          },
          required: ["videoUrl", "imageUrl"]
        }
      }
    });
    
    const data = JSON.parse(response.text || "{}");
    
    return {
      videoUrl: data.videoUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}+execucao`,
      imageUrl: data.imageUrl || `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80`,
      instructions: data.instructions,
      exerciseTips: data.exerciseTips,
      overview: data.overview
    };
  } catch (error) {
    console.error("Media search error:", error);
    return {
      videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}+execucao`,
      imageUrl: `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80`
    };
  }
}

const EXERCISE_DATABASE = `
BANCO DE DADOS DE EXERCÍCIOS AMPLIADO (USE ESTES NOMES):

PEITO:
- Supinos: Supino Reto (Barra/Halter/Máquina/Smith), Supino Inclinado (Barra/Halter/Máquina/Smith), Supino Declinado (Barra/Halter/Máquina/Smith), Supino com Pegada Inversa, Supino no Chão.
- Crucifixos: Crucifixo Reto, Crucifixo Inclinado, Crucifixo Declinado, Peck Deck (Voador), Crucifixo no Cabo, Crossover (Polia Alta/Baixa/Média).
- Outros: Pullover (Halter/Barra), Flexão de Braço (Solo/Inclinada/Declinada/Diamante), Paralelas (Foco Peito), Landmine Press.

COSTAS:
- Puxadas: Puxada Frontal (Aberta/Fechada/Supinada/Triângulo), Puxada Alta, Pulldown (Corda/Barra), Barra Fixa (Pronada/Supinada), Chin-ups.
- Remadas: Remada Curvada (Barra/Halter/Smith), Remada Baixa (Triângulo/Barra Reta), Remada Cavalinho, Remada Unilateral (Serrote), Remada Articulada, Remada Pendlay, Remada Meadows.
- Outros: Levantamento Terra (Convencional/Sumô), Encolhimento (Barra/Halter), Crucifixo Inverso (Halter/Máquina/Cabo), Hiperextensão Lombar, Bom Dia.

OMBROS:
- Desenvolvimentos: Desenvolvimento (Barra/Halter/Máquina/Smith), Arnold Press, Desenvolvimento Militar, Push Press.
- Elevações: Elevação Lateral (Halter/Cabo/Máquina), Elevação Frontal (Barra/Halter/Anilha/Cabo), Elevação Posterior (Crucifixo Inverso).
- Outros: Remada Alta (Barra/Cabo), Face Pull, Elevação em Y, Rotação Externa/Interna (Manguito).

PERNAS:
- Agachamentos: Agachamento Livre (Barra/Halter), Agachamento Hack, Agachamento Frontal, Agachamento Sumô, Agachamento Búlgaro, Agachamento Taça (Goblet), Sissy Squat.
- Máquinas: Leg Press (45/Horizontal), Cadeira Extensora, Mesa Flexora, Cadeira Flexora, Cadeira Abdutora, Cadeira Adutora, Smith Machine.
- Outros: Stiff (Barra/Halter), Afundo, Passada, Avanço, Elevação Pélvica (Barra/Máquina), Levantamento Terra Romeno, Subida no Banco.

BRAÇOS (BÍCEPS E TRÍCEPS):
- Bíceps: Rosca Direta (Barra/Halter/Cabo), Rosca Alternada, Rosca Martelo, Rosca Scott, Rosca Concentrada, Rosca Inversa, Rosca 21, Rosca Zottman, Rosca Aranha.
- Tríceps: Tríceps Pulley (Barra/Corda/V), Tríceps Testa (Barra/Halter/Cabo), Tríceps Francês, Tríceps Coice, Mergulho (Paralelas/Banco), Supino Fechado.

ABDÔMEN E PANTURRILHA:
- Abdômen: Abdominal Crunch (Solo/Máquina/Cabo), Elevação de Pernas (Solo/Barra), Prancha (Isométrica/Lateral), Abdominal Bicicleta, Roda Abdominal, Abdominal Canivete, Russian Twist.
- Panturrilha: Panturrilha em Pé (Máquina/Smith/Solo), Panturrilha Sentado (Máquina), Panturrilha no Leg Press.
`;

export async function generateWorkout(muscleGroups: string[], level: string, biotype: string, age?: number, experienceLevel?: string): Promise<Workout> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const groups = muscleGroups.join(" e ");
  const randomSeed = Math.random().toString(36).substring(7);
  
  const numGroups = muscleGroups.length;
  let exercisesPerGroup = 3;
  if (numGroups === 1) exercisesPerGroup = 6;
  else if (numGroups === 2) exercisesPerGroup = 4;
  else if (numGroups >= 3) exercisesPerGroup = 3;

  const prompt = `Gere um treino de musculação ÚNICO, INOVADOR e DIFERENTE dos anteriores (Seed: ${randomSeed}) combinando os grupos musculares: ${groups}. 
  O nível do usuário (intensidade/dificuldade) é: ${level}.
  O biotipo do usuário é: ${biotype}.
  A idade do usuário é: ${age || 'não informada'} anos.
  O nível de experiência detalhado na academia é: ${experienceLevel || level}.
  
  ${EXERCISE_DATABASE}
  
  REGRAS CRÍTICAS:
  1. TODOS OS NOMES DE EXERCÍCIOS DEVEM ESTAR EM PORTUGUÊS (Ex: "Supino Reto" em vez de "Bench Press").
  2. PRIORIZE EXERCÍCIOS TRADICIONAIS E EFICAZES.
  3. Como o usuário selecionou ${numGroups} grupo(s) muscular(es), você DEVE gerar EXATAMENTE ${exercisesPerGroup} exercícios diferentes para CADA grupo muscular selecionado. O treino total terá aproximadamente ${numGroups * exercisesPerGroup} exercícios.
  4. EXCEÇÕES: Se o grupo for "Panturrilha" ou "Abdômen", no máximo 3 exercícios.
  
  ADAPTAÇÃO POR BIOTIPO (${biotype}) E IDADE (${age}):
  - Ectomorfo: Foco em hipertrofia, intensidade alta, descanso maior (1-2 min), exercícios compostos.
  - Mesomorfo: Equilíbrio entre intensidade e volume, boa variedade de estímulos.
  - Endomorfo: Intensidade alta, descanso menor (30-60s), foco em manter o metabolismo alto.
  - Ajuste o volume e a intensidade de acordo com a idade (${age} anos) para evitar lesões e maximizar resultados.
  
  DETALHES ADICIONAIS:
  - Para cada exercício, estime um "recommendedWeight" (peso recomendado) baseado no nível ${level} (Ex: "12kg", "40kg", "Peso Corporal").
  - Liste os "musclesWorked" (músculos trabalhados) principais (Ex: ["Peitoral Maior", "Tríceps", "Deltoide Anterior"]).
  
  IMPORTANTE PARA OS VÍDEOS E IMAGENS:
  - Para o campo "videoUrl", você DEVE retornar um link de busca do YouTube no formato: https://www.youtube.com/results?search_query=Fitness+Online+[NOME+DO+EXERCICIO+EM+PORTUGUES]
  - Para o campo "imageUrl", NÃO use links aleatórios. Retorne uma string vazia "" e o sistema usará imagens de alta qualidade baseadas no grupo muscular.
  - Para cada exercício, inclua instruções passo a passo ("instructions"), dicas de execução ("exerciseTips"), equipamentos necessários ("equipments") e uma visão geral ("overview").
  
  Retorne um objeto JSON com o seguinte formato:
  {
    "title": "Nome criativo do treino em português",
    "muscleGroup": "${groups}",
    "level": "${level}",
    "exercises": [
      { 
        "name": "Nome do exercício EM PORTUGUÊS", 
        "sets": "Séries", 
        "reps": "Repetições", 
        "rest": "Tempo de descanso", 
        "notes": "Dica técnica curta e motivacional EM PORTUGUÊS",
        "videoUrl": "Link de busca do YouTube",
        "imageUrl": "",
        "recommendedWeight": "Peso recomendado",
        "musclesWorked": ["Músculo 1", "Músculo 2"],
        "instructions": ["Passo 1", "Passo 2"],
        "exerciseTips": ["Dica 1", "Dica 2"],
        "equipments": ["Equipamento"],
        "overview": "Breve visão geral"
      }
    ],
    "tips": ["Dica de intensidade em português", "Dica de nutrição em português"]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            muscleGroup: { type: Type.STRING },
            level: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.STRING },
                  reps: { type: Type.STRING },
                  rest: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  videoUrl: { type: Type.STRING },
                  imageUrl: { 
                    type: Type.STRING,
                    description: "Retorne sempre uma string vazia \"\" para este campo."
                  },
                  recommendedWeight: { type: Type.STRING },
                  musclesWorked: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  exerciseTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                  equipments: { type: Type.ARRAY, items: { type: Type.STRING } },
                  overview: { type: Type.STRING }
                },
                required: ["name", "sets", "reps", "rest", "notes", "videoUrl", "imageUrl", "recommendedWeight", "musclesWorked", "instructions", "exerciseTips", "equipments", "overview"]
              }
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "muscleGroup", "level", "exercises", "tips"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    // Final validation
    if (!data.exercises || !Array.isArray(data.exercises)) {
      throw new Error("A IA não retornou uma lista de exercícios válida.");
    }
    
    return data;
  } catch (error: any) {
    console.error("Error generating workout:", error);
    if (error.message?.includes("max tokens")) {
      throw new Error("O treino solicitado é muito grande para a IA. Tente selecionar menos grupos musculares.");
    }
    throw new Error("Falha ao gerar o treino. Tente novamente em alguns segundos.");
  }
}

export async function generateWeeklyPlan(level: string, biotype: string, age?: number): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const randomSeed = Math.random().toString(36).substring(7);
  const prompt = `Gere um plano de treino semanal ÚNICO e VARIADO (Segunda a Domingo, Seed: ${randomSeed}) para um usuário de nível ${level}, biotipo ${biotype}, idade ${age || 'não informada'} anos.
  O plano deve ser equilibrado e focado em hipertrofia/condicionamento, adaptado para as necessidades do biotipo ${biotype}, idade ${age || 'não informada'} e nível de experiência (${level}).
  Mude a ordem dos grupos musculares ou o foco para não ser sempre igual.
  Para cada dia, forneça o grupo muscular principal e um resumo do objetivo.
  Retorne um objeto JSON:
  {
    "plan": [
      { "day": "Segunda", "focus": "Peito e Tríceps", "description": "Foco em força de empurrar adaptado para ${biotype}" },
      ...
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["day", "focus", "description"]
              }
            }
          },
          required: ["plan"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating weekly plan:", error);
    throw new Error("Falha ao gerar o plano semanal.");
  }
}

export async function findNearbyGyms(lat: number, lng: number): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Quais são as 5 melhores academias de musculação mais próximas de mim? Retorne apenas o nome e o endereço de cada uma.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let gyms = [];
    if (chunks) {
      gyms = chunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({
          title: c.maps.title,
          uri: c.maps.uri
        }));
    }

    if (gyms.length === 0) {
      gyms = [
        { title: "Smart Fit", uri: "https://maps.google.com" },
        { title: "Bluefit", uri: "https://maps.google.com" },
        { title: "Academia Local", uri: "https://maps.google.com" }
      ];
    }

    return gyms;
  } catch (error) {
    console.error("Error finding gyms:", error);
    // Caso ocorra erro de permissão ou não encontre o Gemini
    return [
      { title: "Smart Fit", uri: "https://maps.google.com" },
      { title: "Bluefit", uri: "https://maps.google.com" },
      { title: "Academia Iron", uri: "https://maps.google.com" }
    ];
  }
}

export async function adaptWorkoutWithBiometrics(workout: Workout, biometrics: { sleep: string, heartRate: number }): Promise<Workout> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Adapte o seguinte treino de musculação com base nos dados biométricos do usuário:
  
  DADOS BIOMÉTRICOS:
  - Qualidade do Sono: ${biometrics.sleep}
  - Batimentos Cardíacos em Repouso: ${biometrics.heartRate} bpm
  
  TREINO ATUAL:
  ${JSON.stringify(workout, null, 2)}
  
  REGRAS DE ADAPTAÇÃO:
  1. Se o sono for "Ruim" ou "Regular", reduza o volume (séries) ou aumente o descanso para evitar overtraining.
  2. Se os batimentos estiverem altos (> 80 bpm em repouso), sugira um treino mais leve ou com mais foco em técnica do que em carga.
  3. Se o sono for "Excelente" e batimentos baixos, mantenha ou aumente levemente a intensidade.
  4. Mantenha os nomes dos exercícios em PORTUGUÊS.
  5. Retorne o JSON do treino adaptado no mesmo formato original.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            muscleGroup: { type: Type.STRING },
            level: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.STRING },
                  reps: { type: Type.STRING },
                  rest: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  videoUrl: { type: Type.STRING },
                  imageUrl: { 
                    type: Type.STRING,
                    description: "Retorne sempre uma string vazia \"\" para este campo."
                  },
                  recommendedWeight: { type: Type.STRING },
                  musclesWorked: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  exerciseTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                  equipments: { type: Type.ARRAY, items: { type: Type.STRING } },
                  overview: { type: Type.STRING }
                },
                required: ["name", "sets", "reps", "rest", "notes", "videoUrl", "imageUrl", "recommendedWeight", "musclesWorked", "instructions", "exerciseTips", "equipments", "overview"]
              }
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "muscleGroup", "level", "exercises", "tips"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Adaptation error:", error);
    return workout;
  }
}

export async function generateDailyTip(): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Gere uma dica de musculação ou frase motivacional fitness curta, impactante e inédita para o dia de hoje. 
  Pode ser sobre técnica de exercício, nutrição, descanso ou mentalidade.
  Retorne apenas o texto da dica em português, sem aspas.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "A constância vence o talento quando o talento não é constante. Foque na técnica antes da carga.";
  } catch (error) {
    console.error("Daily tip error:", error);
    return "A constância vence o talento quando o talento não é constante. Foque na técnica antes da carga.";
  }
}
