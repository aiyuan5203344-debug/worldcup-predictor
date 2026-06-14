import Database from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { predictMatch } from './src/utils/aiPrediction.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'database/worldcup.db')

async function cleanupAndSeed() {
  console.log('🔧 Starting database cleanup and re-seed with AI predictions...')
  
  const SQL = await Database()
  const filebuffer = fs.readFileSync(dbPath)
  const db = new SQL.Database(filebuffer)
  
  // Count current matches
  const countResult = db.exec("SELECT COUNT(*) FROM matches")
  const currentCount = countResult[0]?.values[0][0] || 0
  console.log(`📊 Current matches: ${currentCount}`)
  
  // Delete all matches and predictions
  console.log('🗑️  Clearing matches and predictions...')
  db.run("DELETE FROM predictions")
  db.run("DELETE FROM matches")
  
  // Insert missing teams
  console.log('🔄 Ensuring all 48 teams exist...')
  const allTeams = [
    // A组
    { code: 'MEX', name: 'Mexico', name_cn: '墨西哥', flag: '🇲🇽', confederation: 'CONCACAF', fifa_ranking: 14, world_cup_titles: 0, strength_rating: 78, market_value: '€2.8亿', coach: '哈维尔·阿吉雷', captain: '吉列尔莫·奥乔亚', formation: '4-3-3', style: '控球进攻', key_players: '洛萨诺、阿尔瓦雷斯、吉梅内斯', recent_form: 'WLWDW', injuries: '无重大伤病' },
    { code: 'KOR', name: 'South Korea', name_cn: '韩国', flag: '🇰🇷', confederation: 'AFC', fifa_ranking: 23, world_cup_titles: 0, strength_rating: 76, market_value: '€2.5亿', coach: '尤尔根·克林斯曼', captain: '孙兴慜', formation: '4-2-3-1', style: '快速反击', key_players: '孙兴慜、黄喜灿、李刚仁', recent_form: 'WWDDL', injuries: '无重大伤病' },
    { code: 'CZE', name: 'Czech Republic', name_cn: '捷克', flag: '🇨🇿', confederation: 'UEFA', fifa_ranking: 38, world_cup_titles: 0, strength_rating: 72, market_value: '€1.8亿', coach: '伊万·哈谢克', captain: '托马斯·索切克', formation: '3-5-2', style: '高空轰炸', key_players: '索切克、希克、科瓦尔', recent_form: 'DWWLW', injuries: '无重大伤病' },
    { code: 'RSA', name: 'South Africa', name_cn: '南非', flag: '🇿🇦', confederation: 'CAF', fifa_ranking: 55, world_cup_titles: 0, strength_rating: 62, market_value: '€0.6亿', coach: '雨果·布鲁斯', captain: '罗恩·威廉姆斯', formation: '4-4-2', style: '防守反击', key_players: '陶·恩比尼耶马、Zwane', recent_form: 'LDWLL', injuries: '无重大伤病' },
    // B组
    { code: 'CAN', name: 'Canada', name_cn: '加拿大', flag: '🇨🇦', confederation: 'CONCACAF', fifa_ranking: 43, world_cup_titles: 0, strength_rating: 74, market_value: '€2.2亿', coach: '杰西·马施', captain: '阿方索·戴维斯', formation: '3-5-2', style: '防守反击', key_players: '戴维斯、戴维、拉林', recent_form: 'WWDLW', injuries: '无重大伤病' },
    { code: 'BIH', name: 'Bosnia & Herzegovina', name_cn: '波黑', flag: '🇧🇦', confederation: 'UEFA', fifa_ranking: 63, world_cup_titles: 0, strength_rating: 68, market_value: '€1.2亿', coach: '梅多·苏基奇', captain: '埃丁·哲科', formation: '4-4-2', style: '防守反击', key_players: '哲科、皮亚尼奇、科拉希纳茨', recent_form: 'WLWDL', injuries: '无重大伤病' },
    { code: 'QAT', name: 'Qatar', name_cn: '卡塔尔', flag: '🇶🇦', confederation: 'AFC', fifa_ranking: 35, world_cup_titles: 0, strength_rating: 65, market_value: '€0.9亿', coach: '廷廷·马克斯', captain: '哈桑·海多斯', formation: '5-3-2', style: '防守反击', key_players: '阿里、阿费夫、海多斯', recent_form: 'DLLWW', injuries: '无重大伤病' },
    { code: 'CHE', name: 'Switzerland', name_cn: '瑞士', flag: '🇨🇭', confederation: 'UEFA', fifa_ranking: 19, world_cup_titles: 0, strength_rating: 80, market_value: '€3.2亿', coach: '穆拉特·亚金', captain: '格兰尼特·扎卡', formation: '4-2-3-1', style: '整体压迫', key_players: '扎卡、恩多耶、阿坎吉', recent_form: 'WWWDW', injuries: '无重大伤病' },
    // C组
    { code: 'BRA', name: 'Brazil', name_cn: '巴西', flag: '🇧🇷', confederation: 'CONMEBOL', fifa_ranking: 5, world_cup_titles: 5, strength_rating: 92, market_value: '€11.2亿', coach: '多里瓦尔·儒尼奥尔', captain: '马尔基尼奥斯', formation: '4-2-3-1', style: '技术流进攻', key_players: '维尼修斯、罗德里戈、恩德里克', recent_form: 'WWWDW', injuries: '内马尔伤愈复出' },
    { code: 'MAR', name: 'Morocco', name_cn: '摩洛哥', flag: '🇲🇦', confederation: 'CAF', fifa_ranking: 12, world_cup_titles: 0, strength_rating: 82, market_value: '€3.8亿', coach: '瓦利德·雷格拉吉', captain: '阿什拉夫·哈基米', formation: '4-3-3', style: '防守反击', key_players: '哈基米、齐耶赫、恩内斯里', recent_form: 'WWWWL', injuries: '无重大伤病' },
    { code: 'HAI', name: 'Haiti', name_cn: '海地', flag: '🇭🇹', confederation: 'CONCACAF', fifa_ranking: 80, world_cup_titles: 0, strength_rating: 55, market_value: '€0.3亿', coach: '雅巴·卡瓦卡', captain: '杜肯斯·纳宗', formation: '4-4-2', style: '防守反击', key_players: '纳宗、杜塞纳尔', recent_form: 'LDLWL', injuries: '无重大伤病' },
    { code: 'SCO', name: 'Scotland', name_cn: '苏格兰', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA', fifa_ranking: 39, world_cup_titles: 0, strength_rating: 70, market_value: '€1.5亿', coach: '史蒂夫·克拉克', captain: '安德鲁·罗伯逊', formation: '3-4-3', style: '整体压迫', key_players: '罗伯逊、麦克托米奈、亚当斯', recent_form: 'WDLWW', injuries: '无重大伤病' },
    // D组
    { code: 'USA', name: 'United States', name_cn: '美国', flag: '🇺🇸', confederation: 'CONCACAF', fifa_ranking: 11, world_cup_titles: 0, strength_rating: 82, market_value: '€4.5亿', coach: '格雷格·贝哈尔特', captain: '泰勒·亚当斯', formation: '4-3-3', style: '快速反击', key_players: '普利西奇、雷纳、麦肯尼', recent_form: 'WWDWL', injuries: '无重大伤病' },
    { code: 'PAR', name: 'Paraguay', name_cn: '巴拉圭', flag: '🇵🇾', confederation: 'CONMEBOL', fifa_ranking: 50, world_cup_titles: 0, strength_rating: 68, market_value: '€0.8亿', coach: '丹尼尔·加内罗', captain: '米格尔·阿尔米隆', formation: '4-4-2', style: '防守反击', key_players: '阿尔米隆、阿尔多·桑切斯', recent_form: 'DLWWL', injuries: '无重大伤病' },
    { code: 'AUS', name: 'Australia', name_cn: '澳大利亚', flag: '🇦🇺', confederation: 'AFC', fifa_ranking: 24, world_cup_titles: 0, strength_rating: 72, market_value: '€1.5亿', coach: '格拉汉姆·阿诺德', captain: '马修·瑞恩', formation: '4-4-2', style: '长传冲吊', key_players: '库奥尔、赫鲁斯蒂奇、博伊尔', recent_form: 'WLWDW', injuries: '无重大伤病' },
    { code: 'TUR', name: 'Turkey', name_cn: '土耳其', flag: '🇹🇷', confederation: 'UEFA', fifa_ranking: 34, world_cup_titles: 0, strength_rating: 74, market_value: '€2.0亿', coach: '文森佐·蒙特拉', captain: '哈坎·恰尔汗奥卢', formation: '4-2-3-1', style: '快速反击', key_players: '恰尔汗奥卢、居勒、阿克蒂尔科卢', recent_form: 'WWDLW', injuries: '无重大伤病' },
    // E组
    { code: 'GER', name: 'Germany', name_cn: '德国', flag: '🇩🇪', confederation: 'UEFA', fifa_ranking: 13, world_cup_titles: 4, strength_rating: 84, market_value: '€6.5亿', coach: '尤利安·纳格尔斯曼', captain: '伊尔卡伊·京多安', formation: '4-2-3-1', style: '高效进攻', key_players: '维尔茨、穆西亚拉、萨内', recent_form: 'WDWWL', injuries: '无重大伤病' },
    { code: 'CUR', name: 'Curaçao', name_cn: '库拉索', flag: '🇨🇼', confederation: 'CONCACAF', fifa_ranking: 85, world_cup_titles: 0, strength_rating: 50, market_value: '€0.2亿', coach: '迪克·范普德', captain: '利昂纳多·巴西亚', formation: '4-3-3', style: '防守反击', key_players: '巴西亚、卡斯特罗', recent_form: 'LLLWL', injuries: '无重大伤病' },
    { code: 'CIV', name: 'Ivory Coast', name_cn: '科特迪瓦', flag: '🇨🇮', confederation: 'CAF', fifa_ranking: 40, world_cup_titles: 0, strength_rating: 72, market_value: '€1.6亿', coach: '让-路易·加塞', captain: '塞巴斯蒂安·阿莱', formation: '4-3-3', style: '身体对抗', key_players: '阿莱、扎哈、凯西', recent_form: 'WDLWW', injuries: '无重大伤病' },
    { code: 'ECU', name: 'Ecuador', name_cn: '厄瓜多尔', flag: '🇪🇨', confederation: 'CONMEBOL', fifa_ranking: 31, world_cup_titles: 0, strength_rating: 72, market_value: '€1.8亿', coach: '费利克斯·桑切斯', captain: '恩纳·瓦伦西亚', formation: '4-4-2', style: '防守反击', key_players: '瓦伦西亚、凯塞多、埃斯特拉达', recent_form: 'WDLWW', injuries: '无重大伤病' },
    // F组
    { code: 'NED', name: 'Netherlands', name_cn: '荷兰', flag: '🇳🇱', confederation: 'UEFA', fifa_ranking: 7, world_cup_titles: 0, strength_rating: 87, market_value: '€7.2亿', coach: '罗纳德·科曼', captain: '弗吉尔·范迪克', formation: '4-3-3', style: '全攻全守', key_players: '德佩、加克波、邓弗里斯', recent_form: 'WWDWW', injuries: '无重大伤病' },
    { code: 'JPN', name: 'Japan', name_cn: '日本', flag: '🇯🇵', confederation: 'AFC', fifa_ranking: 18, world_cup_titles: 0, strength_rating: 79, market_value: '€2.8亿', coach: '森保一', captain: '远藤航', formation: '4-2-3-1', style: '传控足球', key_players: '久保建英、三笘薫、镰田大地', recent_form: 'WWWWL', injuries: '无重大伤病' },
    { code: 'SWE', name: 'Sweden', name_cn: '瑞典', flag: '🇸🇪', confederation: 'UEFA', fifa_ranking: 33, world_cup_titles: 0, strength_rating: 73, market_value: '€1.8亿', coach: '扬内·安德森', captain: '安德烈亚斯·格兰奎斯特', formation: '4-4-2', style: '防守反击', key_players: '伊萨克、库卢塞夫斯基、福斯贝里', recent_form: 'DLWWL', injuries: '无重大伤病' },
    { code: 'TUN', name: 'Tunisia', name_cn: '突尼斯', flag: '🇹🇳', confederation: 'CAF', fifa_ranking: 32, world_cup_titles: 0, strength_rating: 69, market_value: '€0.9亿', coach: '贾勒勒·卡德里', captain: '尤素夫·姆萨克尼', formation: '4-3-3', style: '防守反击', key_players: '姆萨克尼、瓦赫比、卡兹里', recent_form: 'DWWDL', injuries: '无重大伤病' },
    // G组
    { code: 'BEL', name: 'Belgium', name_cn: '比利时', flag: '🇧🇪', confederation: 'UEFA', fifa_ranking: 4, world_cup_titles: 0, strength_rating: 88, market_value: '€7.5亿', coach: '多梅尼科·特德斯科', captain: '凯文·德布劳内', formation: '3-4-2-1', style: '传控进攻', key_players: '德布劳内、卢卡库、多库', recent_form: 'WWDWW', injuries: '无重大伤病' },
    { code: 'EGY', name: 'Egypt', name_cn: '埃及', flag: '🇪🇬', confederation: 'CAF', fifa_ranking: 36, world_cup_titles: 0, strength_rating: 70, market_value: '€1.2亿', coach: '胡塞因·阿姆鲁', captain: '穆罕默德·萨拉赫', formation: '4-3-3', style: '快速反击', key_players: '萨拉赫、特雷泽盖、穆罕默德', recent_form: 'WWDLW', injuries: '无重大伤病' },
    { code: 'IRN', name: 'Iran', name_cn: '伊朗', flag: '🇮🇷', confederation: 'AFC', fifa_ranking: 20, world_cup_titles: 0, strength_rating: 71, market_value: '€0.9亿', coach: '阿米尔·加勒诺伊', captain: '埃赫桑·哈吉萨菲', formation: '4-4-2', style: '防守反击', key_players: '阿兹蒙、塔雷米、贾汉巴赫什', recent_form: 'DWWDW', injuries: '无重大伤病' },
    { code: 'NZL', name: 'New Zealand', name_cn: '新西兰', flag: '🇳🇿', confederation: 'OFC', fifa_ranking: 95, world_cup_titles: 0, strength_rating: 55, market_value: '€0.3亿', coach: '丹尼·黑', captain: '克里斯·伍德', formation: '4-4-2', style: '长传冲吊', key_players: '伍德、博伊尔', recent_form: 'LDWWL', injuries: '无重大伤病' },
    // H组
    { code: 'ESP', name: 'Spain', name_cn: '西班牙', flag: '🇪🇸', confederation: 'UEFA', fifa_ranking: 8, world_cup_titles: 1, strength_rating: 88, market_value: '€8.5亿', coach: '路易斯·德拉富恩特', captain: '阿尔莫罗·莫拉塔', formation: '4-3-3', style: '传控足球', key_players: '佩德里、加维、亚马尔', recent_form: 'WWWWL', injuries: '无重大伤病' },
    { code: 'CPV', name: 'Cape Verde', name_cn: '佛得角', flag: '🇨🇻', confederation: 'CAF', fifa_ranking: 65, world_cup_titles: 0, strength_rating: 58, market_value: '€0.4亿', coach: '比比斯·阿吉拉尔', captain: '瑞安·门德斯', formation: '4-3-3', style: '防守反击', key_players: '门德斯、蒙泰罗', recent_form: 'DLLWW', injuries: '无重大伤病' },
    { code: 'KSA', name: 'Saudi Arabia', name_cn: '沙特阿拉伯', flag: '🇸🇦', confederation: 'AFC', fifa_ranking: 49, world_cup_titles: 0, strength_rating: 65, market_value: '€0.7亿', coach: '罗伯托·曼奇尼', captain: '萨勒姆·多萨里', formation: '4-2-3-1', style: '防守反击', key_players: '多萨里、谢赫里、法蒂尔', recent_form: 'WDLWW', injuries: '无重大伤病' },
    { code: 'URU', name: 'Uruguay', name_cn: '乌拉圭', flag: '🇺🇾', confederation: 'CONMEBOL', fifa_ranking: 15, world_cup_titles: 2, strength_rating: 83, market_value: '€4.2亿', coach: '马塞洛·贝尔萨', captain: '迭戈·戈丁', formation: '4-3-3', style: '高位逼抢', key_players: '努涅斯、巴尔韦德、乌加尔特', recent_form: 'WWWWL', injuries: '无重大伤病' },
    // I组
    { code: 'FRA', name: 'France', name_cn: '法国', flag: '🇫🇷', confederation: 'UEFA', fifa_ranking: 2, world_cup_titles: 2, strength_rating: 92, market_value: '€12.0亿', coach: '迪迪埃·德尚', captain: '基利安·姆巴佩', formation: '4-2-3-1', style: '快速反击', key_players: '姆巴佩、登贝莱、楚阿梅尼', recent_form: 'WWWWL', injuries: '博格巴伤愈' },
    { code: 'SEN', name: 'Senegal', name_cn: '塞内加尔', flag: '🇸🇳', confederation: 'CAF', fifa_ranking: 17, world_cup_titles: 0, strength_rating: 77, market_value: '€2.8亿', coach: '阿利乌·西塞', captain: '萨迪奥·马内', formation: '4-3-3', style: '速度冲击', key_players: '马内、库利巴利、迪亚洛', recent_form: 'WWWWL', injuries: '无重大伤病' },
    { code: 'IRQ', name: 'Iraq', name_cn: '伊拉克', flag: '🇮🇶', confederation: 'AFC', fifa_ranking: 58, world_cup_titles: 0, strength_rating: 62, market_value: '€0.5亿', coach: '赫苏斯·卡萨斯', captain: '阿拉·阿卜杜勒-扎赫拉', formation: '4-3-3', style: '防守反击', key_players: '阿卜杜勒-扎赫拉、侯赛因', recent_form: 'DLWWL', injuries: '无重大伤病' },
    { code: 'NOR', name: 'Norway', name_cn: '挪威', flag: '🇳🇴', confederation: 'UEFA', fifa_ranking: 47, world_cup_titles: 0, strength_rating: 72, market_value: '€2.5亿', coach: '斯托勒·索尔巴肯', captain: '马丁·厄德高', formation: '4-3-3', style: '快速反击', key_players: '哈兰德、厄德高、索尔洛特', recent_form: 'WWDDL', injuries: '无重大伤病' },
    // J组
    { code: 'ARG', name: 'Argentina', name_cn: '阿根廷', flag: '🇦🇷', confederation: 'CONMEBOL', fifa_ranking: 1, world_cup_titles: 3, strength_rating: 94, market_value: '€12.8亿', coach: '里卡多·阿尔法罗', captain: '里奥·梅西', formation: '4-3-3', style: '控球+快速反击', key_players: '梅西、阿尔瓦雷斯、恩佐·费尔南德斯', recent_form: 'WWWWW', injuries: '梅西状态良好' },
    { code: 'ALG', name: 'Algeria', name_cn: '阿尔及利亚', flag: '🇩🇿', confederation: 'CAF', fifa_ranking: 42, world_cup_titles: 0, strength_rating: 70, market_value: '€1.0亿', coach: '贾迈勒·贝勒马迪', captain: '里亚德·马赫雷斯', formation: '4-3-3', style: '技术流进攻', key_players: '马赫雷斯、本拉赫马、萨利', recent_form: 'WWDLW', injuries: '无重大伤病' },
    { code: 'AUT', name: 'Austria', name_cn: '奥地利', flag: '🇦🇹', confederation: 'UEFA', fifa_ranking: 26, world_cup_titles: 0, strength_rating: 74, market_value: '€2.2亿', coach: '拉尔夫·朗尼克', captain: '大卫·阿拉巴', formation: '4-2-3-1', style: '高位逼抢', key_players: '阿拉巴、萨比策、阿瑙托维奇', recent_form: 'WWWWL', injuries: '无重大伤病' },
    { code: 'JOR', name: 'Jordan', name_cn: '约旦', flag: '🇯🇴', confederation: 'AFC', fifa_ranking: 75, world_cup_titles: 0, strength_rating: 58, market_value: '€0.3亿', coach: '阿卜杜勒拉赫曼·阿扎姆', captain: '哈桑·阿卜杜勒-法塔赫', formation: '4-4-2', style: '防守反击', key_players: '阿卜杜勒-法塔赫、塔马里', recent_form: 'DLLWW', injuries: '无重大伤病' },
    // K组
    { code: 'POR', name: 'Portugal', name_cn: '葡萄牙', flag: '🇵🇹', confederation: 'UEFA', fifa_ranking: 6, world_cup_titles: 0, strength_rating: 88, market_value: '€8.2亿', coach: '罗伯托·马丁内斯', captain: '克里斯蒂亚诺·罗纳尔多', formation: '4-2-3-1', style: '快速反击', key_players: 'C罗、B费、贝尔纳多', recent_form: 'WWWWL', injuries: '无重大伤病' },
    { code: 'COD', name: 'DR Congo', name_cn: '刚果民主共和国', flag: '🇨🇩', confederation: 'CAF', fifa_ranking: 52, world_cup_titles: 0, strength_rating: 65, market_value: '€0.8亿', coach: '塞巴斯蒂安·德萨布雷', captain: '塞德里克·巴坎布', formation: '4-3-3', style: '身体对抗', key_players: '巴坎布、姆本巴、马苏亚库', recent_form: 'WDLWW', injuries: '无重大伤病' },
    { code: 'UZB', name: 'Uzbekistan', name_cn: '乌兹别克斯坦', flag: '🇺🇿', confederation: 'AFC', fifa_ranking: 62, world_cup_titles: 0, strength_rating: 60, market_value: '€0.4亿', coach: '斯雷科·卡塔内茨', captain: '奥季尔·艾哈迈多夫', formation: '4-4-2', style: '防守反击', key_players: '艾哈迈多夫、舒莫罗多夫', recent_form: 'DLWWL', injuries: '无重大伤病' },
    { code: 'COL', name: 'Colombia', name_cn: '哥伦比亚', flag: '🇨🇴', confederation: 'CONMEBOL', fifa_ranking: 14, world_cup_titles: 0, strength_rating: 80, market_value: '€3.5亿', coach: '内斯托尔·洛伦索', captain: '哈梅斯·罗德里格斯', formation: '4-2-3-1', style: '技术流进攻', key_players: '哈梅斯、迪亚斯、卢库米', recent_form: 'WWWWL', injuries: '无重大伤病' },
    // L组
    { code: 'ENG', name: 'England', name_cn: '英格兰', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA', fifa_ranking: 3, world_cup_titles: 1, strength_rating: 90, market_value: '€10.5亿', coach: '加雷斯·索斯盖特', captain: '哈里·凯恩', formation: '4-2-3-1', style: '高效进攻', key_players: '凯恩、贝林厄姆、萨卡', recent_form: 'WWWWL', injuries: '无重大伤病' },
    { code: 'CRO', name: 'Croatia', name_cn: '克罗地亚', flag: '🇭🇷', confederation: 'UEFA', fifa_ranking: 9, world_cup_titles: 0, strength_rating: 85, market_value: '€4.5亿', coach: '兹拉特科·达利奇', captain: '卢卡·莫德里奇', formation: '4-3-3', style: '中场控制', key_players: '莫德里奇、科瓦契奇、格瓦尔迪奥尔', recent_form: 'WDWWW', injuries: '无重大伤病' },
    { code: 'GHA', name: 'Ghana', name_cn: '加纳', flag: '🇬🇭', confederation: 'CAF', fifa_ranking: 46, world_cup_titles: 0, strength_rating: 70, market_value: '€1.3亿', coach: '奥托·阿多', captain: '安德烈·阿尤', formation: '4-3-3', style: '身体对抗', key_players: '阿尤、库杜斯、伊尼亚基·威廉姆斯', recent_form: 'WDLWW', injuries: '无重大伤病' },
    { code: 'PAN', name: 'Panama', name_cn: '巴拿马', flag: '🇵🇦', confederation: 'CONCACAF', fifa_ranking: 57, world_cup_titles: 0, strength_rating: 62, market_value: '€0.5亿', coach: '托马斯·克里斯蒂安森', captain: '安尼巴尔·戈多伊', formation: '4-4-2', style: '防守反击', key_players: '戈多伊、巴伦西亚', recent_form: 'LWWDL', injuries: '无重大伤病' },
  ]
  
  const insertTeamStmt = db.prepare(`
    INSERT OR REPLACE INTO teams (code, name, name_cn, flag, confederation, fifa_ranking, world_cup_titles, strength_rating, market_value, coach, captain, formation, style, key_players, recent_form, injuries)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  for (const team of allTeams) {
    insertTeamStmt.run([team.code, team.name, team.name_cn, team.flag, team.confederation, team.fifa_ranking, team.world_cup_titles, team.strength_rating, team.market_value, team.coach, team.captain, team.formation, team.style, team.key_players, team.recent_form, team.injuries])
  }
  insertTeamStmt.free()
  
  const teamCount = db.exec("SELECT COUNT(*) FROM teams")[0].values[0][0]
  console.log(`✅ Teams in database: ${teamCount}`)
  
  // Helper functions
  const getTeam = (code) => {
    const result = db.exec("SELECT * FROM teams WHERE code = ?", [code])
    if (!result[0]) return null
    const row = result[0].values[0]
    return {
      id: row[0], code: row[1], name: row[2], name_cn: row[3], flag: row[4],
      confederation: row[5], fifa_ranking: row[6], world_cup_titles: row[7],
      strength_rating: row[8], market_value: row[9], coach: row[10],
      captain: row[11], formation: row[12], style: row[13],
      key_players: row[14], recent_form: row[15], injuries: row[16]
    }
  }
  
  const getPlayers = (teamCode) => {
    const result = db.exec("SELECT * FROM players WHERE team_code = ?", [teamCode])
    if (!result[0]) return []
    return result[0].values.map(row => ({
      id: row[0], team_code: row[1], name: row[2], name_cn: row[3],
      position: row[4], number: row[5], age: row[6], club: row[7],
      market_value: row[8], goals: row[9], assists: row[10], caps: row[11],
      is_captain: row[12], is_key_player: row[13], injury_status: row[14]
    }))
  }
  
  // 2026 World Cup Group Stage matches (72 matches)
  // Using correct team codes from seed-teams.js
  const groupMatches = [
    // Group A: USA, MEX, CAN, CHI
    { home: 'USA', away: 'MEX', time: '2026-06-11 20:00:00', status: 'finished', group: 'A', stage: '小组赛', home_score: 2, away_score: 1 },
    { home: 'CAN', away: 'CHI', time: '2026-06-12 17:00:00', status: 'finished', group: 'A', stage: '小组赛', home_score: 1, away_score: 0 },
    { home: 'USA', away: 'CAN', time: '2026-06-17 20:00:00', status: 'upcoming', group: 'A', stage: '小组赛' },
    { home: 'MEX', away: 'CHI', time: '2026-06-17 22:00:00', status: 'upcoming', group: 'A', stage: '小组赛' },
    { home: 'MEX', away: 'CAN', time: '2026-06-22 19:00:00', status: 'upcoming', group: 'A', stage: '小组赛' },
    { home: 'CHI', away: 'USA', time: '2026-06-22 19:00:00', status: 'upcoming', group: 'A', stage: '小组赛' },
    
    // Group B: BRA, SRB, CMR, AUS
    { home: 'BRA', away: 'SRB', time: '2026-06-12 20:00:00', status: 'finished', group: 'B', stage: '小组赛', home_score: 3, away_score: 1 },
    { home: 'CMR', away: 'AUS', time: '2026-06-13 16:00:00', status: 'finished', group: 'B', stage: '小组赛', home_score: 1, away_score: 0 },
    { home: 'BRA', away: 'CMR', time: '2026-06-18 17:00:00', status: 'upcoming', group: 'B', stage: '小组赛' },
    { home: 'SRB', away: 'AUS', time: '2026-06-18 20:00:00', status: 'upcoming', group: 'B', stage: '小组赛' },
    { home: 'BRA', away: 'AUS', time: '2026-06-23 21:00:00', status: 'upcoming', group: 'B', stage: '小组赛' },
    { home: 'SRB', away: 'CMR', time: '2026-06-23 21:00:00', status: 'upcoming', group: 'B', stage: '小组赛' },
    
    // Group C: ARG, IRN, NED, NGA
    { home: 'ARG', away: 'IRN', time: '2026-06-13 20:00:00', status: 'finished', group: 'C', stage: '小组赛', home_score: 2, away_score: 0 },
    { home: 'NED', away: 'NGA', time: '2026-06-14 17:00:00', status: 'finished', group: 'C', stage: '小组赛', home_score: 1, away_score: 1 },
    { home: 'ARG', away: 'NGA', time: '2026-06-19 20:00:00', status: 'upcoming', group: 'C', stage: '小组赛' },
    { home: 'NED', away: 'IRN', time: '2026-06-19 23:00:00', status: 'upcoming', group: 'C', stage: '小组赛' },
    { home: 'ARG', away: 'NED', time: '2026-06-24 20:00:00', status: 'upcoming', group: 'C', stage: '小组赛' },
    { home: 'IRN', away: 'NGA', time: '2026-06-24 20:00:00', status: 'upcoming', group: 'C', stage: '小组赛' },
    
    // Group D: FRA, CHN, DEN, TUN
    { home: 'FRA', away: 'CHN', time: '2026-06-14 20:00:00', status: 'upcoming', group: 'D', stage: '小组赛' },
    { home: 'DEN', away: 'TUN', time: '2026-06-15 17:00:00', status: 'upcoming', group: 'D', stage: '小组赛' },
    { home: 'FRA', away: 'TUN', time: '2026-06-20 20:00:00', status: 'upcoming', group: 'D', stage: '小组赛' },
    { home: 'DEN', away: 'CHN', time: '2026-06-20 23:00:00', status: 'upcoming', group: 'D', stage: '小组赛' },
    { home: 'FRA', away: 'DEN', time: '2026-06-25 21:00:00', status: 'upcoming', group: 'D', stage: '小组赛' },
    { home: 'CHN', away: 'TUN', time: '2026-06-25 21:00:00', status: 'upcoming', group: 'D', stage: '小组赛' },
    
    // Group E: ESP, URU, GER, KOR
    { home: 'ESP', away: 'URU', time: '2026-06-15 20:00:00', status: 'upcoming', group: 'E', stage: '小组赛' },
    { home: 'GER', away: 'KOR', time: '2026-06-16 17:00:00', status: 'upcoming', group: 'E', stage: '小组赛' },
    { home: 'ESP', away: 'KOR', time: '2026-06-21 17:00:00', status: 'upcoming', group: 'E', stage: '小组赛' },
    { home: 'GER', away: 'URU', time: '2026-06-21 20:00:00', status: 'upcoming', group: 'E', stage: '小组赛' },
    { home: 'ESP', away: 'GER', time: '2026-06-26 20:00:00', status: 'upcoming', group: 'E', stage: '小组赛' },
    { home: 'URU', away: 'KOR', time: '2026-06-26 20:00:00', status: 'upcoming', group: 'E', stage: '小组赛' },
    
    // Group F: BEL, MAR, CAN_F, CRO
    { home: 'BEL', away: 'MAR', time: '2026-06-16 20:00:00', status: 'upcoming', group: 'F', stage: '小组赛' },
    { home: 'CAN_F', away: 'CRO', time: '2026-06-17 17:00:00', status: 'upcoming', group: 'F', stage: '小组赛' },
    { home: 'BEL', away: 'CRO', time: '2026-06-22 17:00:00', status: 'upcoming', group: 'F', stage: '小组赛' },
    { home: 'MAR', away: 'CAN_F', time: '2026-06-22 20:00:00', status: 'upcoming', group: 'F', stage: '小组赛' },
    { home: 'BEL', away: 'CAN_F', time: '2026-06-27 21:00:00', status: 'upcoming', group: 'F', stage: '小组赛' },
    { home: 'CRO', away: 'MAR', time: '2026-06-27 21:00:00', status: 'upcoming', group: 'F', stage: '小组赛' },
    
    // Group G: POR, ECU, GHA, SEN
    { home: 'POR', away: 'ECU', time: '2026-06-17 20:00:00', status: 'upcoming', group: 'G', stage: '小组赛' },
    { home: 'GHA', away: 'SEN', time: '2026-06-18 17:00:00', status: 'upcoming', group: 'G', stage: '小组赛' },
    { home: 'POR', away: 'SEN', time: '2026-06-23 17:00:00', status: 'upcoming', group: 'G', stage: '小组赛' },
    { home: 'GHA', away: 'ECU', time: '2026-06-23 20:00:00', status: 'upcoming', group: 'G', stage: '小组赛' },
    { home: 'POR', away: 'GHA', time: '2026-06-28 20:00:00', status: 'upcoming', group: 'G', stage: '小组赛' },
    { home: 'SEN', away: 'ECU', time: '2026-06-28 20:00:00', status: 'upcoming', group: 'G', stage: '小组赛' },
    
    // Group H: ENG, ITA, JPN, AUS
    { home: 'ENG', away: 'ITA', time: '2026-06-18 20:00:00', status: 'upcoming', group: 'H', stage: '小组赛' },
    { home: 'JPN', away: 'AUS', time: '2026-06-19 17:00:00', status: 'upcoming', group: 'H', stage: '小组赛' },
    { home: 'ENG', away: 'JPN', time: '2026-06-24 17:00:00', status: 'upcoming', group: 'H', stage: '小组赛' },
    { home: 'ITA', away: 'AUS', time: '2026-06-24 20:00:00', status: 'upcoming', group: 'H', stage: '小组赛' },
    { home: 'ENG', away: 'ITA', time: '2026-06-29 21:00:00', status: 'upcoming', group: 'H', stage: '小组赛' },
    { home: 'JPN', away: 'ITA', time: '2026-06-29 21:00:00', status: 'upcoming', group: 'H', stage: '小组赛' },
    
    // Group I: FRA, SEN, IRQ, NOR (from seed-teams.js)
    { home: 'FRA', away: 'SEN', time: '2026-06-15 22:00:00', status: 'upcoming', group: 'I', stage: '小组赛' },
    { home: 'IRQ', away: 'NOR', time: '2026-06-16 01:00:00', status: 'upcoming', group: 'I', stage: '小组赛' },
    { home: 'FRA', away: 'IRQ', time: '2026-06-20 22:00:00', status: 'upcoming', group: 'I', stage: '小组赛' },
    { home: 'NOR', away: 'SEN', time: '2026-06-21 01:00:00', status: 'upcoming', group: 'I', stage: '小组赛' },
    { home: 'SEN', away: 'IRQ', time: '2026-06-25 20:00:00', status: 'upcoming', group: 'I', stage: '小组赛' },
    { home: 'NOR', away: 'FRA', time: '2026-06-25 20:00:00', status: 'upcoming', group: 'I', stage: '小组赛' },
    
    // Group J: ARG, ALG, AUT, JOR (from seed-teams.js)
    { home: 'ARG', away: 'ALG', time: '2026-06-16 16:00:00', status: 'upcoming', group: 'J', stage: '小组赛' },
    { home: 'AUT', away: 'JOR', time: '2026-06-16 19:00:00', status: 'upcoming', group: 'J', stage: '小组赛' },
    { home: 'ARG', away: 'AUT', time: '2026-06-21 16:00:00', status: 'upcoming', group: 'J', stage: '小组赛' },
    { home: 'JOR', away: 'ALG', time: '2026-06-21 19:00:00', status: 'upcoming', group: 'J', stage: '小组赛' },
    { home: 'ALG', away: 'AUT', time: '2026-06-26 17:00:00', status: 'upcoming', group: 'J', stage: '小组赛' },
    { home: 'JOR', away: 'ARG', time: '2026-06-26 17:00:00', status: 'upcoming', group: 'J', stage: '小组赛' },
    
    // Group K: POR, COD, UZB, COL (from seed-teams.js)
    { home: 'POR', away: 'COD', time: '2026-06-16 22:00:00', status: 'upcoming', group: 'K', stage: '小组赛' },
    { home: 'UZB', away: 'COL', time: '2026-06-17 01:00:00', status: 'upcoming', group: 'K', stage: '小组赛' },
    { home: 'POR', away: 'UZB', time: '2026-06-21 22:00:00', status: 'upcoming', group: 'K', stage: '小组赛' },
    { home: 'COL', away: 'COD', time: '2026-06-22 01:00:00', status: 'upcoming', group: 'K', stage: '小组赛' },
    { home: 'COD', away: 'UZB', time: '2026-06-26 20:00:00', status: 'upcoming', group: 'K', stage: '小组赛' },
    { home: 'COL', away: 'POR', time: '2026-06-26 20:00:00', status: 'upcoming', group: 'K', stage: '小组赛' },
    
    // Group L: ENG, CRO, GHA, PAN (from seed-teams.js)
    { home: 'ENG', away: 'CRO', time: '2026-06-17 16:00:00', status: 'upcoming', group: 'L', stage: '小组赛' },
    { home: 'GHA', away: 'PAN', time: '2026-06-17 19:00:00', status: 'upcoming', group: 'L', stage: '小组赛' },
    { home: 'ENG', away: 'GHA', time: '2026-06-22 16:00:00', status: 'upcoming', group: 'L', stage: '小组赛' },
    { home: 'PAN', away: 'CRO', time: '2026-06-22 19:00:00', status: 'upcoming', group: 'L', stage: '小组赛' },
    { home: 'CRO', away: 'GHA', time: '2026-06-27 16:00:00', status: 'upcoming', group: 'L', stage: '小组赛' },
    { home: 'PAN', away: 'ENG', time: '2026-06-27 16:00:00', status: 'upcoming', group: 'L', stage: '小组赛' },
  ]
  
  console.log(`⚽ Inserting ${groupMatches.length} group stage matches with AI predictions...`)
  
  let successCount = 0
  let errorCount = 0
  
  const insertStmt = db.prepare(`
    INSERT INTO matches (home_team, away_team, match_time, status, group_name, stage, 
                         home_score, away_score, predicted_home_score, predicted_away_score, 
                         predicted_result, ai_confidence, ai_analysis,
                         home_rating, away_rating, home_win_prob, draw_prob, away_win_prob)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  for (const match of groupMatches) {
    try {
      const homeTeam = getTeam(match.home)
      const awayTeam = getTeam(match.away)
      
      if (!homeTeam || !awayTeam) {
        console.warn(`⚠️ Team not found: ${match.home} vs ${match.away}`)
        errorCount++
        continue
      }
      
      const homePlayers = getPlayers(match.home)
      const awayPlayers = getPlayers(match.away)
      
      // Run AI prediction
      const prediction = predictMatch(match, homeTeam, awayTeam, homePlayers, awayPlayers)
      
      insertStmt.run([
        match.home, match.away, match.time, match.status, match.group, match.stage,
        match.home_score || null, match.away_score || null,
        prediction.predicted_home_score, prediction.predicted_away_score,
        prediction.predicted_result, prediction.ai_confidence, prediction.ai_analysis,
        prediction.home_rating, prediction.away_rating,
        prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob
      ])
      
      successCount++
      
    } catch (error) {
      console.error(`❌ Error processing ${match.home} vs ${match.away}:`, error.message)
      errorCount++
    }
  }
  
  insertStmt.free()
  
  console.log(`✅ Matches seeded: ${successCount} success, ${errorCount} errors`)
  
  // Count final matches
  const finalCount = db.exec("SELECT COUNT(*) FROM matches")
  const total = finalCount[0]?.values[0][0] || 0
  console.log(`📊 Total matches in database: ${total}`)
  
  // Show some stats
  const stats = db.exec(`
    SELECT status, COUNT(*) as count 
    FROM matches 
    GROUP BY status
  `)
  console.log('\n📊 Match status breakdown:')
  for (const row of stats[0].values) {
    console.log(`   ${row[0]}: ${row[1]}`)
  }
  
  // Print sample prediction
  const sampleMatch = db.exec("SELECT home_team, away_team, predicted_home_score, predicted_away_score, ai_confidence, home_win_prob, draw_prob, away_win_prob, ai_analysis FROM matches WHERE ai_analysis IS NOT NULL LIMIT 1")
  if (sampleMatch[0]?.values[0]) {
    const row = sampleMatch[0].values[0]
    console.log('\n📊 Sample AI Prediction:')
    console.log(`  ${row[0]} vs ${row[1]}`)
    console.log(`  Predicted Score: ${row[2]}-${row[3]}`)
    console.log(`  Confidence: ${row[4]}%`)
    console.log(`  Home Win: ${row[5]}% | Draw: ${row[6]}% | Away Win: ${row[7]}%`)
    console.log(`  Analysis: ${row[8]?.substring(0, 150)}...`)
  }
  
  // Save database
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)
  console.log('\n💾 Database saved!')
  
  db.close()
}

cleanupAndSeed().catch(console.error)
