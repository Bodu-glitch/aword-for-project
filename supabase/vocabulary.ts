import { supabase } from "@/lib/supabase";
import { Vocabulary } from "@/models/Vocabulary";

export const fetchRandomVocabulary = async (): Promise<Vocabulary | null> => {
  try {
    // First, get the count of vocabulary items
    const { count, error: countError } = await supabase
      .from("vocab")
      .select("*", { count: "exact", head: true });

    if (countError || !count || count === 0) {
      console.error("Error fetching vocabulary count:", countError);
      return null;
    }

    // Generate random offset
    const randomOffset = Math.floor(Math.random() * count);

    // Fetch vocabulary with random offset
    const { data, error } = await supabase
      .from("vocab")
      .select("*")
      .range(randomOffset, randomOffset)
      .limit(1);

    if (error) {
      console.error("Error fetching vocabulary:", error);
      return null;
    }

    if (data && data.length > 0) {
      return data[0] as Vocabulary;
    }

    return null;
  } catch (error) {
    console.error("Error fetching vocabulary:", error);
    return null;
  }
};

export const fetchVocabularyById = async (
  id: string,
): Promise<Vocabulary | null> => {
  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching vocabulary by ID:", error);
      return null;
    }

    return data as Vocabulary;
  } catch (error) {
    console.error("Error fetching vocabulary by ID:", error);
    return null;
  }
};

export const fetchVocabularyByWord = async (
  word: string,
): Promise<Vocabulary | null> => {
  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("*")
      .eq("word", word)
      .single();

    if (error) {
      console.error("Error fetching vocabulary by word:", error);
      return null;
    }

    return data as Vocabulary;
  } catch (error) {
    console.error("Error fetching vocabulary by word:", error);
    return null;
  }
};

export const fetchVocabularyList = async (
  limit: number = 50,
): Promise<Vocabulary[]> => {
  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("*")
      .limit(limit);

    if (error) {
      console.error("Error fetching vocabulary list:", error);
      return [];
    }

    return data as Vocabulary[];
  } catch (error) {
    console.error("Error fetching vocabulary list:", error);
    return [];
  }
};

export const searchVocabulary = async (
  searchTerm: string,
): Promise<Vocabulary[]> => {
  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("*")
      .or(`word.ilike.%${searchTerm}%, definition_vi.ilike.%${searchTerm}%`);

    if (error) {
      console.error("Error searching vocabulary:", error);
      return [];
    }

    return data as Vocabulary[];
  } catch (error) {
    console.error("Error searching vocabulary:", error);
    return [];
  }
};

export const getTotalVocabularyCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("vocab")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching vocabulary count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error fetching vocabulary count:", error);
    return 0;
  }
};

export const fetchVocabularyBatch = async (
  offset: number = 0,
  limit: number = 20,
): Promise<Vocabulary[]> => {
  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("*,vocab_senses(*), vocab_examples(*)")
      .range(offset, offset + limit - 1)
      .order("id");

    if (error) {
      console.error("Error fetching vocabulary batch:", error);
      return [];
    }

    const result = data?.map((item) => {
      return {
        ...item,
        pos: item.vocab_senses[0]?.pos || "",
        definition_vi: item.vocab_senses[0]?.definition || "",
      };
    });

    return result as Vocabulary[];
  } catch (error) {
    console.error("Error fetching vocabulary batch:", error);
    return [];
  }
};

export const fetchRandomVocabularyBatch = async (
  limit: number = 20,
): Promise<Vocabulary[]> => {
  try {
    // First, get the count of vocabulary items
    const { count, error: countError } = await supabase
      .from("vocab")
      .select("*, vocab_senses(*), vocab_examples(*)", {
        count: "exact",
        head: true,
      });

    if (countError || !count || count === 0) {
      console.error("Error fetching vocabulary count:", countError);
      return [];
    }

    // Generate random offset ensuring we don't go out of bounds
    const maxOffset = Math.max(0, count - limit);
    const randomOffset = Math.floor(Math.random() * (maxOffset + 1));

    // Fetch vocabulary with random offset
    const { data, error } = await supabase
      .from("vocab")
      .select("*")
      .range(randomOffset, randomOffset + limit - 1);

    if (error) {
      console.error("Error fetching random vocabulary batch:", error);
      return [];
    }

    return data?.map((d) => {
      return {
        ...d,
        pos: d.vocab_senses[0]?.pos || "",
        definition_vi: d.vocab_senses[0]?.definition || "",
        example_en: d.vocab_examples[0]?.example_en || "",
        example_vi: d.vocab_examples[0]?.example_vi || "",
      };
    }) as Vocabulary[];
  } catch (error) {
    console.error("Error fetching random vocabulary batch:", error);
    return [];
  }
};

export const fetchAllVocabulary = async (): Promise<Vocabulary[]> => {
  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("*")
      .order("prefix", { ascending: true })
      .order("word", { ascending: true });

    if (error) {
      console.error("Error fetching all vocabulary:", error);
      return [];
    }

    return data as Vocabulary[];
  } catch (error) {
    console.error("Error fetching all vocabulary:", error);
    return [];
  }
};
