TripMode

add this in proguard to get this image picket issue at add trip screen

-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }

-keep class kotlin.Pair { *; }

-keep class kotlin.Metadata { *; }
-keepattributes *Annotation*, InnerClasses, Signature, EnclosingMethod, RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations
-keepnames class kotlin.** { *; }
-keepclassmembers class ** {
    @kotlin.Metadata *;
}