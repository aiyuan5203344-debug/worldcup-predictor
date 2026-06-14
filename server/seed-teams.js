import { dbRun } from './src/models/database.js'

// 2026世界杯48支球队数据（12组×4队）
const teams = [
  // A组
  { code: 'MEX', name: 'Mexico', name_cn: '墨西哥', flag: '🇲🇽', confederation: 'CONCACAF', fifa_ranking: 14, world_cup_titles: 0, strength_rating: 78, market_value: '€2.8亿', coach: '哈维尔·阿吉雷', captain: '吉列尔莫·奥乔亚', formation: '4-3-3', style: '控球进攻', key_players: '洛萨诺、阿尔瓦雷斯、吉梅内斯', recent_form: 'WLWDW', injuries: '无重大伤病', group_name: 'A' },
  { code: 'KOR', name: 'South Korea', name_cn: '韩国', flag: '🇰🇷', confederation: 'AFC', fifa_ranking: 23, world_cup_titles: 0, strength_rating: 76, market_value: '€2.5亿', coach: '尤尔根·克林斯曼', captain: '孙兴慜', formation: '4-2-3-1', style: '快速反击', key_players: '孙兴慜、黄喜灿、李刚仁', recent_form: 'WWDDL', injuries: '无重大伤病', group_name: 'A' },
  { code: 'CZE', name: 'Czech Republic', name_cn: '捷克', flag: '🇨🇿', confederation: 'UEFA', fifa_ranking: 38, world_cup_titles: 0, strength_rating: 72, market_value: '€1.8亿', coach: '伊万·哈谢克', captain: '托马斯·索切克', formation: '3-5-2', style: '高空轰炸', key_players: '索切克、希克、科瓦尔', recent_form: 'DWWLW', injuries: '无重大伤病', group_name: 'A' },
  { code: 'RSA', name: 'South Africa', name_cn: '南非', flag: '🇿🇦', confederation: 'CAF', fifa_ranking: 55, world_cup_titles: 0, strength_rating: 62, market_value: '€0.6亿', coach: '雨果·布鲁斯', captain: '罗恩·威廉姆斯', formation: '4-4-2', style: '防守反击', key_players: '陶·恩比尼耶马、Zwane', recent_form: 'LDWLL', injuries: '无重大伤病', group_name: 'A' },

  // B组
  { code: 'CAN', name: 'Canada', name_cn: '加拿大', flag: '🇨🇦', confederation: 'CONCACAF', fifa_ranking: 43, world_cup_titles: 0, strength_rating: 74, market_value: '€2.2亿', coach: '杰西·马施', captain: '阿方索·戴维斯', formation: '3-5-2', style: '防守反击', key_players: '戴维斯、戴维、拉林', recent_form: 'WWDLW', injuries: '无重大伤病', group_name: 'B' },
  { code: 'BIH', name: 'Bosnia & Herzegovina', name_cn: '波黑', flag: '🇧🇦', confederation: 'UEFA', fifa_ranking: 63, world_cup_titles: 0, strength_rating: 68, market_value: '€1.2亿', coach: '梅多·苏基奇', captain: '埃丁·哲科', formation: '4-4-2', style: '防守反击', key_players: '哲科、皮亚尼奇、科拉希纳茨', recent_form: 'WLWDL', injuries: '无重大伤病', group_name: 'B' },
  { code: 'QAT', name: 'Qatar', name_cn: '卡塔尔', flag: '🇶🇦', confederation: 'AFC', fifa_ranking: 35, world_cup_titles: 0, strength_rating: 65, market_value: '€0.9亿', coach: '廷廷·马克斯', captain: '哈桑·海多斯', formation: '5-3-2', style: '防守反击', key_players: '阿里、阿费夫、海多斯', recent_form: 'DLLWW', injuries: '无重大伤病', group_name: 'B' },
  { code: 'CHE', name: 'Switzerland', name_cn: '瑞士', flag: '🇨🇭', confederation: 'UEFA', fifa_ranking: 19, world_cup_titles: 0, strength_rating: 80, market_value: '€3.2亿', coach: '穆拉特·亚金', captain: '格兰尼特·扎卡', formation: '4-2-3-1', style: '整体压迫', key_players: '扎卡、恩多耶、阿坎吉', recent_form: 'WWWDW', injuries: '无重大伤病', group_name: 'B' },

  // C组
  { code: 'BRA', name: 'Brazil', name_cn: '巴西', flag: '🇧🇷', confederation: 'CONMEBOL', fifa_ranking: 5, world_cup_titles: 5, strength_rating: 92, market_value: '€11.2亿', coach: '多里瓦尔·儒尼奥尔', captain: '马尔基尼奥斯', formation: '4-2-3-1', style: '技术流进攻', key_players: '维尼修斯、罗德里戈、恩德里克', recent_form: 'WWWDW', injuries: '内马尔伤愈复出', group_name: 'C' },
  { code: 'MAR', name: 'Morocco', name_cn: '摩洛哥', flag: '🇲🇦', confederation: 'CAF', fifa_ranking: 12, world_cup_titles: 0, strength_rating: 82, market_value: '€3.8亿', coach: '瓦利德·雷格拉吉', captain: '阿什拉夫·哈基米', formation: '4-3-3', style: '防守反击', key_players: '哈基米、齐耶赫、恩内斯里', recent_form: 'WWWWL', injuries: '无重大伤病', group_name: 'C' },
  { code: 'HAI', name: 'Haiti', name_cn: '海地', flag: '🇭🇹', confederation: 'CONCACAF', fifa_ranking: 80, world_cup_titles: 0, strength_rating: 55, market_value: '€0.3亿', coach: '雅巴·卡瓦卡', captain: '杜肯斯·纳宗', formation: '4-4-2', style: '防守反击', key_players: '纳宗、杜塞纳尔', recent_form: 'LDLWL', injuries: '无重大伤病', group_name: 'C' },
  { code: 'SCO', name: 'Scotland', name_cn: '苏格兰', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA', fifa_ranking: 39, world_cup_titles: 0, strength_rating: 70, market_value: '€1.5亿', coach: '史蒂夫·克拉克', captain: '安德鲁·罗伯逊', formation: '3-4-3', style: '整体压迫', key_players: '罗伯逊、麦克托米奈、亚当斯', recent_form: 'WDLWW', injuries: '无重大伤病', group_name: 'C' },

  // D组
  { code: 'USA', name: 'United States', name_cn: '美国', flag: '🇺🇸', confederation: 'CONCACAF', fifa_ranking: 11, world_cup_titles: 0, strength_rating: 82, market_value: '€4.5亿', coach: '格雷格·贝哈尔特', captain: '泰勒·亚当斯', formation: '4-3-3', style: '快速反击', key_players: '普利西奇、雷纳、麦肯尼', recent_form: 'WWDWL', injuries: '无重大伤病', group_name: 'D' },
  { code: 'PAR', name: 'Paraguay', name_cn: '巴拉圭', flag: '🇵🇾', confederation: 'CONMEBOL', fifa_ranking: 50, world_cup_titles: 0, strength_rating: 68, market_value: '€0.8亿', coach: '丹尼尔·加内罗', captain: '米格尔·阿尔米隆', formation: '4-4-2', style: '防守反击', key_players: '阿尔米隆、阿尔多·桑切斯', recent_form: 'DLWWL', injuries: '无重大伤病', group_name: 'D' },
  { code: 'AUS', name: 'Australia', name_cn: '澳大利亚', flag: '🇦🇺', confederation: 'AFC', fifa_ranking: 24, world_cup_titles: 0, strength_rating: 72, market_value: '€1.5亿', coach: '格拉汉姆·阿诺德', captain: '马修·瑞恩', formation: '4-4-2', style: '长传冲吊', key_players: '库奥尔、赫鲁斯蒂奇、博伊尔', recent_form: 'WLWDW', injuries: '无重大伤病', group_name: 'D' },
  { code: 'TUR', name: 'Turkey', name_cn: '土耳其', flag: '🇹🇷', confederation: 'UEFA', fifa_ranking: 34, world_cup_titles: 0, strength_rating: 74, market_value: '€2.0亿', coach: '文森佐·蒙特拉', captain: '哈坎·恰尔汗奥卢', formation: '4-2-3-1', style: '快速反击', key_players: '恰尔汗奥卢、居勒、阿克蒂尔科卢', recent_form: 'WWDLW', injuries: '无重大伤病', group_name: 'D' },

  // E组
  { code: 'GER', name: 'Germany', name_cn: '德国', flag: '🇩🇪', confederation: 'UEFA', fifa_ranking: 13, world_cup_titles: 4, strength_rating: 84, market_value: '€6.5亿', coach: '尤利安·纳格尔斯曼', captain: '伊尔卡伊·京多安', formation: '4-2-3-1', style: '高效进攻', key_players: '维尔茨、穆西亚拉、萨内', recent_form: 'WDWWL', injuries: '无重大伤病', group_name: 'E' },
  { code: 'CUR', name: 'Curaçao', name_cn: '库拉索', flag: '🇨🇼', confederation: 'CONCACAF', fifa_ranking: 85, world_cup_titles: 0, strength_rating: 50, market_value: '€0.2亿', coach: '迪克·范普德', captain: '利昂纳多·巴西亚', formation: '4-3-3', style: '防守反击', key_players: '巴西亚、卡斯特罗', recent_form: 'LLLWL', injuries: '无重大伤病', group_name: 'E' },
  { code: 'CIV', name: 'Ivory Coast', name_cn: '科特迪瓦', flag: '🇨🇮', confederation: 'CAF', fifa_ranking: 40, world_cup_titles: 0, strength_rating: 72, market_value: '€1.6亿', coach: '让-路易·加塞', captain: '塞巴斯蒂安·阿莱', formation: '4-3-3', style: '身体对抗', key_players: '阿莱、扎哈、凯西', recent_form: 'WDLWW', injuries: '无重大伤病', group_name: 'E' },
  { code: 'ECU', name: 'Ecuador', name_cn: '厄瓜多尔', flag: '🇪🇨', confederation: 'CONMEBOL', fifa_ranking: 31, world_cup_titles: 0, strength_rating: 72, market_value: '€1.8亿', coach: '费利克斯·桑切斯', captain: '恩纳·瓦伦西亚', formation: '4-4-2', style: '防守反击', key_players: '瓦伦西亚、凯塞多、埃斯特拉达', recent_form: 'WDLWW', injuries: '无重大伤病', group_name: 'E' },

  // F组
  { code: 'NED', name: 'Netherlands', name_cn: '荷兰', flag: '🇳🇱', confederation: 'UEFA', fifa_ranking: 7, world_cup_titles: 0, strength_rating: 87, market_value: '€7.2亿', coach: '罗纳德·科曼', captain: '弗吉尔·范迪克', formation: '4-3-3', style: '全攻全守', key_players: '德佩、加克波、邓弗里斯', recent_form: 'WWDWW', injuries: '无重大伤病', group_name: 'F' },
  { code: 'JPN', name: 'Japan', name_cn: '日本', flag: '🇯🇵', confederation: 'AFC', fifa_ranking: 18, world_cup_titles: 0, strength_rating: 79, market_value: '€2.8亿', coach: '森保一', captain: '远藤航', formation: '4-2-3-1', style: '传控足球', key_players: '久保建英、三笘薫、镰田大地', recent_form: 'WWWWL', injuries: '无重大伤病', group_name: 'F' },
  { code: 'SWE', name: 'Sweden', name_cn: '瑞典', flag: '🇸🇪', confederation: 'UEFA', fifa_ranking: 33, world_cup_titles: 0, strength_rating: 73, market_value: '€1.8亿', coach: '扬内·安德森', captain: '安德烈亚斯·格兰奎斯特', formation: '4-4-2', style: '防守反击', key_players: '伊萨克、库卢塞夫斯基、福斯贝里', recent_form: 'DLWWL', injuries: '无重大伤病', group_name: 'F' },
  { code: 'TUN', name: 'Tunisia', name_cn: '突尼斯', flag: '🇹🇳', confederation: 'CAF', fifa_ranking: 32, world_cup_titles: 0, strength_rating: 69, market_value: '€0.9亿', coach: '贾勒勒·卡德里', captain: '尤素夫·姆萨克尼', formation: '4-3-3', style: '防守反击', key_players: '姆萨克尼、瓦赫比、卡兹里', recent_form: 'DWWDL', injuries: '无重大伤病', group_name: 'F' },

  // G组
  { code: 'BEL', name: 'Belgium', name_cn: '比利时', flag: '🇧🇪', confederation: 'UEFA', fifa_ranking: 4, world_cup_titles: 0, strength_rating: 88, market_value: '€7.5亿', coach: '多梅尼科·特德斯科', captain: '凯文·德布劳内', formation: '3-4-2-1', style: '传控进攻', key_players: '德布劳内、卢卡库、多库', recent_form: 'WWDWW', injuries: '无重大伤病', group_name: 'G' },
  { code: 'EGY', name: 'Egypt', name_cn: '埃及', flag: '🇪🇬', confederation: 'CAF', fifa_ranking: 36, world_cup_titles: 0, strength_rating: 70, market_value: '€1.2亿', coach: '胡塞因·阿姆鲁', captain: '穆罕默德·萨拉赫', formation: '4-3-3', style: '快速反击', key_players: '萨拉赫、特雷泽盖、穆罕默德', recent_form: 'WWDLW', injuries: '无重大伤病', group_name: 'G' },
  { code: 'IRN', name: 'Iran', name_cn: '伊朗', flag: '🇮🇷', confederation: 'AFC', fifa_ranking: 20, world_cup_titles: 0, strength_rating: 71, market_value: '€0.9亿', coach: '阿米尔·加勒诺伊', captain: '埃赫桑·哈吉萨菲', formation: '4-4-2', style: '防守反击', key_players: '阿兹蒙、塔雷米、贾汉巴赫什', recent_form: 'DWWDW', injuries: '无重大伤病', group_name: 'G' },
  { code: 'NZL', name: 'New Zealand', name_cn: '新西兰', flag: '🇳🇿', confederation: 'OFC', fifa_ranking: 95, world_cup_titles: 0, strength_rating: 55, market_value: '€0.3亿', coach: '丹尼·黑', captain: '克里斯·伍德', formation: '4-4-2', style: '长传冲吊', key_players: '伍德、博伊尔', recent_form: 'LDWWL', injuries: '无重大伤病', group_name: 'G' },

  // H组
  { code: 'ESP', name: 'Spain', name_cn: '西班牙', flag: '🇪🇸', confederation: 'UEFA', fifa_ranking: 8, world_cup_titles: 1, strength_rating: 88, market_value: '€8.5亿', coach: '路易斯·德拉富恩特', captain: '阿尔莫罗·莫拉塔', formation: '4-3-3', style: '传控足球', key_players: '佩德里、加维、亚马尔', recent_form: 'WWWWL', injuries: '无重大伤病', group_name: 'H' },
  { code: 'CPV', name: 'Cape Verde', name_cn: '佛得角', flag: '🇨🇻', confederation: 'CAF', fifa_ranking: 65, world_cup_titles: 0, strength_rating: 58, market_value: '€0.4亿', coach: '比比斯·阿吉拉尔', captain: '瑞安·门德斯', formation: '4-3-3', style: '防守反击', key_players: '门德斯、蒙泰罗', recent_form: 'DLLWW', injuries: '无重大伤病', group_name: 'H' },
  { code: 'KSA', name: 'Saudi Arabia', name_cn: '沙特阿拉伯', flag: '🇸🇦', confederation: 'AFC', fifa_ranking: 49, world_cup_titles: 0, strength_rating: 65, market_value: '€0.7亿', coach: '罗伯托·曼奇尼', captain: '萨勒姆·多萨里', formation: '4-2-3-1', style: '防守反击', key_players: '多萨里、谢赫里、法蒂尔', recent_form: 'WDLWW', injuries: '无重大伤病', group_name: 'H' },
  { code: 'URU', name: 'Uruguay', name_cn: '乌拉圭', flag: '🇺🇾', confederation: 'CONMEBOL', fifa_ranking: 15, world_cup_titles: 2, strength_rating: 83, market_value: '€4.2亿', coach: '马塞洛·贝尔萨', captain: '迭戈·戈丁', formation: '4-3-3', style: '高位逼抢', key_players: '努涅斯、巴尔韦德、乌加尔特', recent_form: 'WWWWL', injuries: '无重大伤病', group_name: 'H' },

  // I组
  { code: 'FRA', name: 'France', name_cn: '法国', flag: '🇫🇷', confederation: 'UEFA', fifa_ranking: 2, world_cup_titles: 2, strength_rating: 92, market_value: '€12.0亿', coach: '迪迪埃·德尚', captain: '基利安·姆巴佩', formation: '4-2-3-1', style: '快速反击', key_players: '姆巴佩、登贝莱、楚阿梅尼', recent_form: 'WWWWL', injuries: '博格巴伤愈', group_name: 'I' },
  { code: 'SEN', name: 'Senegal', name_cn: '塞内加尔', flag: '🇸🇳', confederation: 'CAF', fifa_ranking: 17, world_cup_titles: 0, strength_rating: 77, market_value: '€2.8亿', coach: '阿利乌·西塞', captain: '萨迪奥·马内', formation: '4-3-3', style: '速度冲击', key_players: '马内、库利巴利、迪亚洛', recent_form: 'WWWWL', injuries: '无重大伤病', group_name: 'I' },
  { code: 'IRQ', name: 'Iraq', name_cn: '伊拉克', flag: '🇮🇶', confederation: 'AFC', fifa_ranking: 58, world_cup_titles: 0, strength_rating: 62, market_value: '€0.5亿', coach: '赫苏斯·卡萨斯', captain: '阿拉·阿卜杜勒-扎赫拉', formation: '4-3-3', style: '防守反击', key_players: '阿卜杜勒-扎赫拉、侯赛因', recent_form: 'DLWWL', injuries: '无重大伤病', group_name: 'I' },
  { code: 'NOR', name: 'Norway', name_cn: '挪威', flag: '🇳🇴', confederation: 'UEFA', fifa_ranking: 47, world_cup_titles: 0, strength_rating: 72, market_value: '€2.5亿', coach: '斯托勒·索尔巴肯', captain: '马丁·厄德高', formation: '4-3-3', style: '快速反击', key_players: '哈兰德、厄德高、索尔洛特', recent_form: 'WWDDL', injuries: '无重大伤病', group_name: 'I' },

  // J组
  { code: 'ARG', name: 'Argentina', name_cn: '阿根廷', flag: '🇦🇷', confederation: 'CONMEBOL', fifa_ranking: 1, world_cup_titles: 3, strength_rating: 94, market_value: '€12.8亿', coach: '里卡多·阿尔法罗', captain: '里奥·梅西', formation: '4-3-3', style: '控球+快速反击', key_players: '梅西、阿尔瓦雷斯、恩佐·费尔南德斯', recent_form: 'WWWWW', injuries: '梅西状态良好', group_name: 'J' },
  { code: 'ALG', name: 'Algeria', name_cn: '阿尔及利亚', flag: '🇩🇿', confederation: 'CAF', fifa_ranking: 42, world_cup_titles: 0, strength_rating: 70, market_value: '€1.0亿', coach: '贾迈勒·贝勒马迪', captain: '里亚德·马赫雷斯', formation: '4-3-3', style: '技术流进攻', key_players: '马赫雷斯、本拉赫马、萨利', recent_form: 'WWDLW', injuries: '无重大伤病', group_name: 'J' },
  { code: 'AUT', name: 'Austria', name_cn: '奥地利', flag: '🇦🇹', confederation: 'UEFA', fifa_ranking: 26, world_cup_titles: 0, strength_rating: 74, market_value: '€2.2亿', coach: '拉尔夫·朗尼克', captain: '大卫·阿拉巴', formation: '4-2-3-1', style: '高位逼抢', key_players: '阿拉巴、萨比策、阿瑙托维奇', recent_form: 'WWWWL', injuries: '无重大伤病', group_name: 'J' },
  { code: 'JOR', name: 'Jordan', name_cn: '约旦', flag: '🇯🇴', confederation: 'AFC', fifa_ranking: 75, world_cup_titles: 0, strength_rating: 58, market_value: '€0.3亿', coach: '阿卜杜勒拉赫曼·阿扎姆', captain: '哈桑·阿卜杜勒-法塔赫', formation: '4-4-2', style: '防守反击', key_players: '阿卜杜勒-法塔赫、塔马里', recent_form: 'DLLWW', injuries: '无重大伤病', group_name: 'J' },

  // K组
  { code: 'POR', name: 'Portugal', name_cn: '葡萄牙', flag: '🇵🇹', confederation: 'UEFA', fifa_ranking: 6, world_cup_titles: 0, strength_rating: 88, market_value: '€8.2亿', coach: '罗伯托·马丁内斯', captain: '克里斯蒂亚诺·罗纳尔多', formation: '4-2-3-1', style: '快速反击', key_players: 'C罗、B费、贝尔纳多', recent_form: 'WWWWL', injuries: '无重大伤病', group_name: 'K' },
  { code: 'COD', name: 'DR Congo', name_cn: '刚果民主共和国', flag: '🇨🇩', confederation: 'CAF', fifa_ranking: 52, world_cup_titles: 0, strength_rating: 65, market_value: '€0.8亿', coach: '塞巴斯蒂安·德萨布雷', captain: '塞德里克·巴坎布', formation: '4-3-3', style: '身体对抗', key_players: '巴坎布、姆本巴、马苏亚库', recent_form: 'WDLWW', injuries: '无重大伤病', group_name: 'K' },
  { code: 'UZB', name: 'Uzbekistan', name_cn: '乌兹别克斯坦', flag: '🇺🇿', confederation: 'AFC', fifa_ranking: 62, world_cup_titles: 0, strength_rating: 60, market_value: '€0.4亿', coach: '斯雷科·卡塔内茨', captain: '奥季尔·艾哈迈多夫', formation: '4-4-2', style: '防守反击', key_players: '艾哈迈多夫、舒莫罗多夫', recent_form: 'DLWWL', injuries: '无重大伤病', group_name: 'K' },
  { code: 'COL', name: 'Colombia', name_cn: '哥伦比亚', flag: '🇨🇴', confederation: 'CONMEBOL', fifa_ranking: 14, world_cup_titles: 0, strength_rating: 80, market_value: '€3.5亿', coach: '内斯托尔·洛伦索', captain: '哈梅斯·罗德里格斯', formation: '4-2-3-1', style: '技术流进攻', key_players: '哈梅斯、迪亚斯、卢库米', recent_form: 'WWWWL', injuries: '无重大伤病', group_name: 'K' },

  // L组
  { code: 'ENG', name: 'England', name_cn: '英格兰', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA', fifa_ranking: 3, world_cup_titles: 1, strength_rating: 90, market_value: '€10.5亿', coach: '加雷斯·索斯盖特', captain: '哈里·凯恩', formation: '4-2-3-1', style: '高效进攻', key_players: '凯恩、贝林厄姆、萨卡', recent_form: 'WWWWL', injuries: '无重大伤病', group_name: 'L' },
  { code: 'CRO', name: 'Croatia', name_cn: '克罗地亚', flag: '🇭🇷', confederation: 'UEFA', fifa_ranking: 9, world_cup_titles: 0, strength_rating: 85, market_value: '€4.5亿', coach: '兹拉特科·达利奇', captain: '卢卡·莫德里奇', formation: '4-3-3', style: '中场控制', key_players: '莫德里奇、科瓦契奇、格瓦尔迪奥尔', recent_form: 'WDWWW', injuries: '无重大伤病', group_name: 'L' },
  { code: 'GHA', name: 'Ghana', name_cn: '加纳', flag: '🇬🇭', confederation: 'CAF', fifa_ranking: 46, world_cup_titles: 0, strength_rating: 70, market_value: '€1.3亿', coach: '奥托·阿多', captain: '安德烈·阿尤', formation: '4-3-3', style: '身体对抗', key_players: '阿尤、库杜斯、伊尼亚基·威廉姆斯', recent_form: 'WDLWW', injuries: '无重大伤病', group_name: 'L' },
  { code: 'PAN', name: 'Panama', name_cn: '巴拿马', flag: '🇵🇦', confederation: 'CONCACAF', fifa_ranking: 57, world_cup_titles: 0, strength_rating: 62, market_value: '€0.5亿', coach: '托马斯·克里斯蒂安森', captain: '安尼巴尔·戈多伊', formation: '4-4-2', style: '防守反击', key_players: '戈多伊、巴伦西亚', recent_form: 'LWWDL', injuries: '无重大伤病', group_name: 'L' },
]

// 重点球队的球员数据（每队5-11名主力）
const players = [
  // 阿根廷
  { team_code: 'ARG', name: 'Lionel Messi', name_cn: '利昂内尔·梅西', position: 'RW', number: 10, club: 'Inter Miami', age: 37, market_value: '€3500万', goals: 108, assists: 56, caps: 187, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'ARG', name: 'Julián Álvarez', name_cn: '胡利安·阿尔瓦雷斯', position: 'ST', number: 9, club: 'Manchester City', age: 24, market_value: '€9000万', goals: 12, assists: 5, caps: 36, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'ARG', name: 'Enzo Fernández', name_cn: '恩佐·费尔南德斯', position: 'CM', number: 8, club: 'Chelsea', age: 23, market_value: '€7500万', goals: 4, assists: 6, caps: 32, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'ARG', name: 'Emiliano Martínez', name_cn: '埃米利亚诺·马丁内斯', position: 'GK', number: 23, club: 'Aston Villa', age: 31, market_value: '€3500万', goals: 0, assists: 0, caps: 45, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'ARG', name: 'Nicolás Otamendi', name_cn: '尼古拉斯·奥塔门迪', position: 'CB', number: 19, club: 'Benfica', age: 36, market_value: '€800万', goals: 5, assists: 3, caps: 120, is_captain: 0, is_key_player: 0, injury_status: 'fit' },

  // 巴西
  { team_code: 'BRA', name: 'Vinícius Jr.', name_cn: '维尼修斯', position: 'LW', number: 7, club: 'Real Madrid', age: 24, market_value: '€1.8亿', goals: 15, assists: 8, caps: 38, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'BRA', name: 'Rodrygo', name_cn: '罗德里戈', position: 'RW', number: 11, club: 'Real Madrid', age: 23, market_value: '€1亿', goals: 8, assists: 6, caps: 30, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'BRA', name: 'Neymar Jr.', name_cn: '内马尔', position: 'LW', number: 10, club: 'Al-Hilal', age: 32, market_value: '€6000万', goals: 79, assists: 56, caps: 128, is_captain: 0, is_key_player: 1, injury_status: 'recovering' },
  { team_code: 'BRA', name: 'Alisson', name_cn: '阿利松', position: 'GK', number: 1, club: 'Liverpool', age: 31, market_value: '€5000万', goals: 0, assists: 0, caps: 65, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'BRA', name: 'Marquinhos', name_cn: '马尔基尼奥斯', position: 'CB', number: 4, club: 'PSG', age: 30, market_value: '€7000万', goals: 5, assists: 2, caps: 85, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 法国
  { team_code: 'FRA', name: 'Kylian Mbappé', name_cn: '基利安·姆巴佩', position: 'ST', number: 10, club: 'Real Madrid', age: 25, market_value: '€1.8亿', goals: 46, assists: 28, caps: 85, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'FRA', name: 'Ousmane Dembélé', name_cn: '奥斯曼·登贝莱', position: 'RW', number: 7, club: 'PSG', age: 27, market_value: '€6000万', goals: 12, assists: 15, caps: 50, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'FRA', name: 'Aurélien Tchouaméni', name_cn: '奥雷利安·楚阿梅尼', position: 'CDM', number: 14, club: 'Real Madrid', age: 24, market_value: '€8000万', goals: 3, assists: 4, caps: 38, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'FRA', name: 'Mike Maignan', name_cn: '迈克·梅尼昂', position: 'GK', number: 16, club: 'AC Milan', age: 28, market_value: '€4000万', goals: 0, assists: 0, caps: 12, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 英格兰
  { team_code: 'ENG', name: 'Harry Kane', name_cn: '哈里·凯恩', position: 'ST', number: 9, club: 'Bayern Munich', age: 30, market_value: '€1亿', goals: 63, assists: 19, caps: 90, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'ENG', name: 'Jude Bellingham', name_cn: '裘德·贝林厄姆', position: 'CAM', number: 10, club: 'Real Madrid', age: 21, market_value: '€1.5亿', goals: 8, assists: 5, caps: 35, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'ENG', name: 'Bukayo Saka', name_cn: '布卡约·萨卡', position: 'RW', number: 7, club: 'Arsenal', age: 22, market_value: '€1.2亿', goals: 12, assists: 10, caps: 40, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'ENG', name: 'Jordan Pickford', name_cn: '乔丹·皮克福德', position: 'GK', number: 1, club: 'Everton', age: 30, market_value: '€3000万', goals: 0, assists: 0, caps: 60, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 德国
  { team_code: 'GER', name: 'Florian Wirtz', name_cn: '弗洛里安·维尔茨', position: 'CAM', number: 10, club: 'Bayer Leverkusen', age: 21, market_value: '€1.3亿', goals: 10, assists: 12, caps: 25, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'GER', name: 'Jamal Musiala', name_cn: '贾马尔·穆西亚拉', position: 'CAM', number: 42, club: 'Bayern Munich', age: 21, market_value: '€1.1亿', goals: 8, assists: 6, caps: 30, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'GER', name: 'Leroy Sané', name_cn: '勒罗伊·萨内', position: 'RW', number: 10, club: 'Bayern Munich', age: 28, market_value: '€7000万', goals: 15, assists: 12, caps: 60, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'GER', name: 'Manuel Neuer', name_cn: '曼努埃尔·诺伊尔', position: 'GK', number: 1, club: 'Bayern Munich', age: 38, market_value: '€1000万', goals: 0, assists: 0, caps: 115, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 西班牙
  { team_code: 'ESP', name: 'Pedri', name_cn: '佩德里', position: 'CM', number: 8, club: 'Barcelona', age: 21, market_value: '€1亿', goals: 6, assists: 8, caps: 28, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'ESP', name: 'Gavi', name_cn: '加维', position: 'CM', number: 6, club: 'Barcelona', age: 20, market_value: '€9000万', goals: 4, assists: 5, caps: 25, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'ESP', name: 'Lamine Yamal', name_cn: '拉明·亚马尔', position: 'RW', number: 19, club: 'Barcelona', age: 17, market_value: '€1.2亿', goals: 5, assists: 7, caps: 15, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'ESP', name: 'Unai Simón', name_cn: '乌奈·西蒙', position: 'GK', number: 23, club: 'Athletic Bilbao', age: 27, market_value: '€3000万', goals: 0, assists: 0, caps: 35, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 葡萄牙
  { team_code: 'POR', name: 'Cristiano Ronaldo', name_cn: '克里斯蒂亚诺·罗纳尔多', position: 'ST', number: 7, club: 'Al-Nassr', age: 39, market_value: '€2000万', goals: 130, assists: 42, caps: 210, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'POR', name: 'Bruno Fernandes', name_cn: '布鲁诺·费尔南德斯', position: 'CAM', number: 8, club: 'Manchester United', age: 29, market_value: '€7000万', goals: 20, assists: 18, caps: 65, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'POR', name: 'Bernardo Silva', name_cn: '贝尔纳多·席尔瓦', position: 'RW', number: 10, club: 'Manchester City', age: 29, market_value: '€8000万', goals: 12, assists: 15, caps: 90, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'POR', name: 'Diogo Costa', name_cn: '迪奥戈·科斯塔', position: 'GK', number: 1, club: 'Porto', age: 24, market_value: '€4000万', goals: 0, assists: 0, caps: 20, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 比利时
  { team_code: 'BEL', name: 'Kevin De Bruyne', name_cn: '凯文·德布劳内', position: 'CAM', number: 17, club: 'Manchester City', age: 33, market_value: '€5000万', goals: 28, assists: 48, caps: 100, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'BEL', name: 'Romelu Lukaku', name_cn: '罗梅卢·卢卡库', position: 'ST', number: 10, club: 'Roma', age: 31, market_value: '€4000万', goals: 85, assists: 20, caps: 115, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'BEL', name: 'Jérémy Doku', name_cn: '杰里米·多库', position: 'LW', number: 11, club: 'Manchester City', age: 21, market_value: '€6500万', goals: 5, assists: 8, caps: 25, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'BEL', name: 'Thibaut Courtois', name_cn: '蒂博·库尔图瓦', position: 'GK', number: 1, club: 'Real Madrid', age: 32, market_value: '€3500万', goals: 0, assists: 0, caps: 100, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 荷兰
  { team_code: 'NED', name: 'Virgil van Dijk', name_cn: '弗吉尔·范迪克', position: 'CB', number: 4, club: 'Liverpool', age: 33, market_value: '€3000万', goals: 8, assists: 5, caps: 75, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'NED', name: 'Memphis Depay', name_cn: '孟菲斯·德佩', position: 'ST', number: 10, club: 'Atletico Madrid', age: 30, market_value: '€3500万', goals: 45, assists: 25, caps: 90, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'NED', name: 'Cody Gakpo', name_cn: '科迪·加克波', position: 'LW', number: 18, club: 'Liverpool', age: 25, market_value: '€6000万', goals: 10, assists: 6, caps: 30, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'NED', name: 'Mark Flekken', name_cn: '马克·弗莱肯', position: 'GK', number: 1, club: 'Brentford', age: 30, market_value: '€2000万', goals: 0, assists: 0, caps: 10, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 克罗地亚
  { team_code: 'CRO', name: 'Luka Modrić', name_cn: '卢卡·莫德里奇', position: 'CM', number: 10, club: 'Real Madrid', age: 39, market_value: '€1000万', goals: 25, assists: 30, caps: 175, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'CRO', name: 'Mateo Kovačić', name_cn: '马特奥·科瓦契奇', position: 'CM', number: 8, club: 'Manchester City', age: 30, market_value: '€4000万', goals: 8, assists: 10, caps: 95, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'CRO', name: 'Joško Gvardiol', name_cn: '约什科·格瓦尔迪奥尔', position: 'CB', number: 4, club: 'Manchester City', age: 22, market_value: '€7500万', goals: 3, assists: 2, caps: 30, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 摩洛哥
  { team_code: 'MAR', name: 'Achraf Hakimi', name_cn: '阿什拉夫·哈基米', position: 'RB', number: 2, club: 'PSG', age: 25, market_value: '€6500万', goals: 8, assists: 12, caps: 60, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'MAR', name: 'Hakim Ziyech', name_cn: '哈基姆·齐耶赫', position: 'CAM', number: 10, club: 'Galatasaray', age: 31, market_value: '€2000万', goals: 18, assists: 15, caps: 60, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'MAR', name: 'Youssef En-Nesyri', name_cn: '尤素夫·恩内斯里', position: 'ST', number: 9, club: 'Sevilla', age: 27, market_value: '€2500万', goals: 22, assists: 5, caps: 65, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 意大利
  { team_code: 'ITA', name: 'Gianluigi Donnarumma', name_cn: '詹卢伊吉·多纳鲁马', position: 'GK', number: 1, club: 'PSG', age: 25, market_value: '€4000万', goals: 0, assists: 0, caps: 60, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'ITA', name: 'Nicolò Barella', name_cn: '尼科洛·巴雷拉', position: 'CM', number: 8, club: 'Inter Milan', age: 27, market_value: '€7000万', goals: 10, assists: 12, caps: 50, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 日本
  { team_code: 'JPN', name: 'Takefusa Kubo', name_cn: '久保建英', position: 'RW', number: 10, club: 'Real Sociedad', age: 22, market_value: '€5000万', goals: 8, assists: 6, caps: 35, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'JPN', name: 'Daichi Kamada', name_cn: '镰田大地', position: 'CAM', number: 8, club: 'Lazio', age: 27, market_value: '€2500万', goals: 10, assists: 8, caps: 40, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 韩国
  { team_code: 'KOR', name: 'Son Heung-min', name_cn: '孙兴慜', position: 'LW', number: 7, club: 'Tottenham', age: 31, market_value: '€4500万', goals: 40, assists: 20, caps: 120, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'KOR', name: 'Hwang Hee-chan', name_cn: '黄喜灿', position: 'ST', number: 11, club: 'Wolves', age: 28, market_value: '€2500万', goals: 8, assists: 5, caps: 55, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'KOR', name: 'Lee Kang-in', name_cn: '李刚仁', position: 'CAM', number: 18, club: 'PSG', age: 23, market_value: '€3500万', goals: 6, assists: 8, caps: 30, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 美国
  { team_code: 'USA', name: 'Christian Pulisic', name_cn: '克里斯蒂安·普利西奇', position: 'LW', number: 10, club: 'AC Milan', age: 25, market_value: '€4000万', goals: 28, assists: 15, caps: 65, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'USA', name: 'Giovanni Reyna', name_cn: '吉奥瓦尼·雷纳', position: 'CAM', number: 7, club: 'Borussia Dortmund', age: 21, market_value: '€3000万', goals: 5, assists: 6, caps: 25, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'USA', name: 'Weston McKennie', name_cn: '韦斯顿·麦肯尼', position: 'CM', number: 8, club: 'Juventus', age: 25, market_value: '€3500万', goals: 8, assists: 5, caps: 50, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 加拿大
  { team_code: 'CAN', name: 'Alphonso Davies', name_cn: '阿方索·戴维斯', position: 'LB', number: 12, club: 'Bayern Munich', age: 23, market_value: '€7000万', goals: 5, assists: 10, caps: 45, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'CAN', name: 'Jonathan David', name_cn: '乔纳森·戴维', position: 'ST', number: 9, club: 'Lille', age: 24, market_value: '€5000万', goals: 25, assists: 8, caps: 50, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 墨西哥
  { team_code: 'MEX', name: 'Guillermo Ochoa', name_cn: '吉列尔莫·奥乔亚', position: 'GK', number: 13, club: 'Salernitana', age: 39, market_value: '€500万', goals: 0, assists: 0, caps: 150, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'MEX', name: 'Hirving Lozano', name_cn: '希尔文·洛萨诺', position: 'RW', number: 22, club: 'PSV', age: 29, market_value: '€2500万', goals: 15, assists: 8, caps: 70, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 塞内加尔
  { team_code: 'SEN', name: 'Sadio Mané', name_cn: '萨迪奥·马内', position: 'LW', number: 10, club: 'Al-Nassr', age: 32, market_value: '€3000万', goals: 35, assists: 18, caps: 100, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'SEN', name: 'Kalidou Koulibaly', name_cn: '卡利杜·库利巴利', position: 'CB', number: 3, club: 'Al-Hilal', age: 33, market_value: '€2000万', goals: 5, assists: 2, caps: 75, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 乌拉圭
  { team_code: 'URU', name: 'Darwin Núñez', name_cn: '达尔文·努涅斯', position: 'ST', number: 9, club: 'Liverpool', age: 25, market_value: '€8000万', goals: 15, assists: 5, caps: 30, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'URU', name: 'Federico Valverde', name_cn: '费德里科·巴尔韦德', position: 'CM', number: 15, club: 'Real Madrid', age: 25, market_value: '€1亿', goals: 8, assists: 10, caps: 50, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 挪威
  { team_code: 'NOR', name: 'Erling Haaland', name_cn: '埃尔林·哈兰德', position: 'ST', number: 9, club: 'Manchester City', age: 24, market_value: '€1.8亿', goals: 35, assists: 8, caps: 30, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'NOR', name: 'Martin Ødegaard', name_cn: '马丁·厄德高', position: 'CAM', number: 10, club: 'Arsenal', age: 25, market_value: '€1亿', goals: 10, assists: 15, caps: 55, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 哥伦比亚
  { team_code: 'COL', name: 'James Rodríguez', name_cn: '哈梅斯·罗德里格斯', position: 'CAM', number: 10, club: 'Rayo Vallecano', age: 33, market_value: '€1500万', goals: 28, assists: 25, caps: 100, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'COL', name: 'Luis Díaz', name_cn: '路易斯·迪亚斯', position: 'LW', number: 7, club: 'Liverpool', age: 27, market_value: '€5000万', goals: 12, assists: 8, caps: 45, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 瑞士
  { team_code: 'CHE', name: 'Granit Xhaka', name_cn: '格兰尼特·扎卡', position: 'CDM', number: 34, club: 'Bayer Leverkusen', age: 31, market_value: '€3000万', goals: 12, assists: 10, caps: 120, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 丹麦
  { team_code: 'DEN', name: 'Christian Eriksen', name_cn: '克里斯蒂安·埃里克森', position: 'CAM', number: 10, club: 'Manchester United', age: 32, market_value: '€1500万', goals: 40, assists: 35, caps: 130, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 土耳其
  { team_code: 'TUR', name: 'Hakan Çalhanoğlu', name_cn: '哈坎·恰尔汗奥卢', position: 'CM', number: 10, club: 'Inter Milan', age: 30, market_value: '€3500万', goals: 18, assists: 15, caps: 85, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 澳大利亚
  { team_code: 'AUS', name: 'Mathew Ryan', name_cn: '马修·瑞恩', position: 'GK', number: 1, club: 'AZ Alkmaar', age: 32, market_value: '€500万', goals: 0, assists: 0, caps: 80, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 沙特阿拉伯
  { team_code: 'KSA', name: 'Salem Al-Dawsari', name_cn: '萨勒姆·多萨里', position: 'LW', number: 10, club: 'Al-Hilal', age: 33, market_value: '€800万', goals: 22, assists: 12, caps: 85, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 埃及
  { team_code: 'EGY', name: 'Mohamed Salah', name_cn: '穆罕默德·萨拉赫', position: 'RW', number: 10, club: 'Liverpool', age: 32, market_value: '€6000万', goals: 55, assists: 35, caps: 95, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 奥地利
  { team_code: 'AUT', name: 'David Alaba', name_cn: '大卫·阿拉巴', position: 'CB', number: 4, club: 'Real Madrid', age: 32, market_value: '€2500万', goals: 15, assists: 12, caps: 100, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 阿尔及利亚
  { team_code: 'ALG', name: 'Riyad Mahrez', name_cn: '里亚德·马赫雷斯', position: 'RW', number: 7, club: 'Al-Ahli', age: 33, market_value: '€1500万', goals: 30, assists: 20, caps: 95, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 波黑
  { team_code: 'BIH', name: 'Edin Džeko', name_cn: '埃丁·哲科', position: 'ST', number: 11, club: 'Fenerbahçe', age: 38, market_value: '€500万', goals: 65, assists: 25, caps: 135, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 捷克
  { team_code: 'CZE', name: 'Tomáš Souček', name_cn: '托马斯·索切克', position: 'CM', number: 23, club: 'West Ham', age: 29, market_value: '€3000万', goals: 15, assists: 8, caps: 65, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 瑞典
  { team_code: 'SWE', name: 'Alexander Isak', name_cn: '亚历山大·伊萨克', position: 'ST', number: 9, club: 'Newcastle', age: 24, market_value: '€7000万', goals: 12, assists: 5, caps: 40, is_captain: 0, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'SWE', name: 'Dejan Kulusevski', name_cn: '德扬·库卢塞夫斯基', position: 'RW', number: 21, club: 'Tottenham', age: 24, market_value: '€5000万', goals: 8, assists: 10, caps: 45, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 突尼斯
  { team_code: 'TUN', name: 'Youssef Msakni', name_cn: '尤素夫·姆萨克尼', position: 'CAM', number: 10, club: 'Al-Arabi', age: 34, market_value: '€500万', goals: 20, assists: 15, caps: 95, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 加纳
  { team_code: 'GHA', name: 'André Ayew', name_cn: '安德烈·阿尤', position: 'ST', number: 10, club: 'Le Havre', age: 35, market_value: '€800万', goals: 28, assists: 12, caps: 120, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'GHA', name: 'Mohammed Kudus', name_cn: '穆罕默德·库杜斯', position: 'CAM', number: 20, club: 'West Ham', age: 23, market_value: '€4500万', goals: 10, assists: 5, caps: 35, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 巴拿马
  { team_code: 'PAN', name: 'Aníbal Godoy', name_cn: '安尼巴尔·戈多伊', position: 'CDM', number: 6, club: 'Nashville SC', age: 34, market_value: '€300万', goals: 5, assists: 8, caps: 120, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 海地
  { team_code: 'HAI', name: 'Duckens Nazon', name_cn: '杜肯斯·纳宗', position: 'ST', number: 9, club: 'Quebec', age: 30, market_value: '€200万', goals: 15, assists: 5, caps: 55, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 苏格兰
  { team_code: 'SCO', name: 'Andrew Robertson', name_cn: '安德鲁·罗伯逊', position: 'LB', number: 26, club: 'Liverpool', age: 30, market_value: '€3000万', goals: 5, assists: 20, caps: 75, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
  { team_code: 'SCO', name: 'Scott McTominay', name_cn: '斯科特·麦克托米奈', position: 'CM', number: 4, club: 'Napoli', age: 27, market_value: '€3500万', goals: 8, assists: 3, caps: 50, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 刚果民主共和国
  { team_code: 'COD', name: 'Cédric Bakambu', name_cn: '塞德里克·巴坎布', position: 'ST', number: 9, club: 'Galatasaray', age: 33, market_value: '€800万', goals: 18, assists: 8, caps: 45, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 乌兹别克斯坦
  { team_code: 'UZB', name: 'Odil Ahmedov', name_cn: '奥季尔·艾哈迈多夫', position: 'CM', number: 8, club: 'Shanghai SIPG', age: 36, market_value: '€300万', goals: 12, assists: 10, caps: 85, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 新西兰
  { team_code: 'NZL', name: 'Chris Wood', name_cn: '克里斯·伍德', position: 'ST', number: 9, club: 'Nottingham Forest', age: 32, market_value: '€1500万', goals: 35, assists: 10, caps: 65, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 佛得角
  { team_code: 'CPV', name: 'Ryan Mendes', name_cn: '瑞安·门德斯', position: 'LW', number: 10, club: 'Al-Nasr', age: 34, market_value: '€200万', goals: 12, assists: 8, caps: 55, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 库拉索
  { team_code: 'CUR', name: 'Leandro Bacuna', name_cn: '利昂纳多·巴西亚', position: 'CM', number: 8, club: 'FC Groningen', age: 32, market_value: '€300万', goals: 8, assists: 5, caps: 35, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 南非
  { team_code: 'RSA', name: 'Percy Tau', name_cn: '珀西·陶', position: 'ST', number: 10, club: 'Al Ahly', age: 30, market_value: '€800万', goals: 15, assists: 8, caps: 40, is_captain: 0, is_key_player: 1, injury_status: 'fit' },

  // 科特迪瓦
  { team_code: 'CIV', name: 'Sébastien Haller', name_cn: '塞巴斯蒂安·阿莱', position: 'ST', number: 9, club: 'Borussia Dortmund', age: 30, market_value: '€2000万', goals: 12, assists: 5, caps: 25, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 伊拉克
  { team_code: 'IRQ', name: 'Aymen Abdulfattah', name_cn: '阿拉·阿卜杜勒-扎赫拉', position: 'CM', number: 8, club: 'Al-Shorta', age: 35, market_value: '€300万', goals: 10, assists: 12, caps: 90, is_captain: 1, is_key_player: 1, injury_status: 'fit' },

  // 约旦
  { team_code: 'JOR', name: 'Abdallah Said', name_cn: '哈桑·阿卜杜勒-法塔赫', position: 'CAM', number: 10, club: 'Al-Faisaly', age: 32, market_value: '€200万', goals: 15, assists: 10, caps: 75, is_captain: 1, is_key_player: 1, injury_status: 'fit' },
]

const seedTeamsAndPlayers = async () => {
  try {
    console.log('🔄 Seeding 48 teams...')
    
    for (const team of teams) {
      dbRun(`
        INSERT OR REPLACE INTO teams (code, name, name_cn, flag, confederation, fifa_ranking, world_cup_titles, strength_rating, market_value, coach, captain, formation, style, key_players, recent_form, injuries)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        team.code, team.name, team.name_cn, team.flag, team.confederation, 
        team.fifa_ranking, team.world_cup_titles, team.strength_rating, 
        team.market_value, team.coach, team.captain, team.formation, 
        team.style, team.key_players, team.recent_form, team.injuries
      ])
    }
    
    console.log(`✅ Seeded ${teams.length} teams`)
    
    console.log('🔄 Seeding players...')
    
    for (const player of players) {
      dbRun(`
        INSERT OR REPLACE INTO players (team_code, name, name_cn, position, number, club, age, market_value, goals, assists, caps, is_captain, is_key_player, injury_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        player.team_code, player.name, player.name_cn, player.position, 
        player.number, player.club, player.age, player.market_value,
        player.goals, player.assists, player.caps, 
        player.is_captain, player.is_key_player, player.injury_status
      ])
    }
    
    console.log(`✅ Seeded ${players.length} players`)
    console.log('✅ Teams and players seeding completed!')
    
  } catch (error) {
    console.error('❌ Error seeding teams and players:', error)
  }
}

export default seedTeamsAndPlayers
