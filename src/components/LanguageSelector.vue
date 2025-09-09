<template>
  <div class="language-selector">
    <label for="language">{{ $t("language.select") }}:</label>
    <select id="language" v-model="selectedLanguage" @change="onLanguageChange">
      <option value="pt-BR">{{ $t("language.pt") }}</option>
      <option value="es">{{ $t("language.es") }}</option>
      <option value="en">{{ $t("language.en") }}</option>
    </select>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

export default {
  name: "LanguageSelector",
  setup() {
    const { locale } = useI18n();
    const selectedLanguage = ref(locale.value);

    onMounted(() => {
      selectedLanguage.value = locale.value;
    });

    const onLanguageChange = () => {
      locale.value = selectedLanguage.value;
    };

    return {
      selectedLanguage,
      onLanguageChange,
    };
  },
};
</script>

<style scoped>
.language-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.language-selector label {
  font-size: 12px;
  opacity: 0.9;
}

.language-selector select {
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid var(--muted);
  background: #0e141b;
  color: var(--fg);
  font-size: 12px;
  cursor: pointer;
}

.language-selector select:focus {
  outline: none;
  border-color: var(--accent);
}
</style>
