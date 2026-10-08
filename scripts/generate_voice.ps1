Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoiceByHints([System.Speech.Synthesis.VoiceGender]::Female)
$synth.Rate = 0
$synth.Volume = 100
$targetPath = Join-Path (Get-Location) "public\new_order_voice.wav"
$synth.SetOutputToWaveFile($targetPath)
$synth.Speak("New order! New order!")
$synth.SetOutputToNull()
Write-Output "Successfully saved to $targetPath"
